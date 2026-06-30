# Appraisal pipeline — cost tracking & cost-reduction levers

This directory contains the AI car-appraisal pipeline. Task #22 added
per-appraisal Anthropic cost tracking, aggregate cost reporting, and three
**disabled-by-default** cost-reduction levers.

## Per-appraisal cost columns

Every appraisal row in PostgreSQL carries usage and cost metadata for both
Claude stages of the pipeline. All money values are stored as **integer
cents (USD)** — never floats, never dollars-as-strings.

| Column | Type | Description |
| --- | --- | --- |
| `stage1_model` / `stage2_model` | text | Claude model id used for each stage (e.g. `claude-opus-4-5`). |
| `stage1_input_tokens` / `stage2_input_tokens` | int | Prompt input tokens billed at the full input rate. |
| `stage1_output_tokens` / `stage2_output_tokens` | int | Completion tokens billed at the output rate. |
| `stage1_cache_creation_tokens` / `stage2_cache_creation_tokens` | int | Tokens written into the Anthropic prompt cache. |
| `stage1_cache_read_tokens` / `stage2_cache_read_tokens` | int | Tokens read from the prompt cache (cheap). |
| `stage1_cost_cents` / `stage2_cost_cents` | int | Cents spent on each stage. |
| `total_cost_cents` | int | `stage1 + stage2` cents — the value shown in staff UI. |

`null` in any of these columns means "we don't have a number for this run"
(usually a Stage 1 cache hit or a pre-Task-#22 row). Storage and UI both
treat `null` as "—".

## Cost computation

The single source of truth is `computeAnthropicCostCents()` in
`server/appraisal/cost.ts`. It takes a `{ model, inputTokens, outputTokens,
cacheCreationTokens, cacheReadTokens }` shape and returns an integer number
of cents using the per-million-token prices in the `PRICING` table.

Defaults are for `claude-opus-4-5`:

| Token kind | Price (USD / M tok) |
| --- | --- |
| Input | $15.00 |
| Output | $75.00 |
| Cache create | $18.75 |
| Cache read | $1.50 |

Cost is computed in the orchestrator inside a `try / catch`. **A
cost-side failure must never fail the appraisal** — on error the orchestrator
persists `null` cents and logs a console error, but the appraisal still
completes and the customer email still sends.

## Staff surfaces

- **List view (`appraisal-list-view.tsx`)** — shows a per-row `Cost`
  column (`total_cost_cents`) and a sortable Cost header that flips between
  desc → asc → desc and clears back to `createdAt desc` if another column
  is sorted later.
- **Detail view (`appraisal-detail-view.tsx`)** — shows model + cost +
  tokens for each stage individually, plus the total.
- **Aggregate card** — at the top of the list view, four buckets:
  Today / Last 7 days / Last 30 days / All time. Each bucket shows count,
  total cost, and average per appraisal.

## Aggregate endpoint

`GET /api/admin/appraisals/cost-summary` (staff-gated) returns the four
buckets in this shape:

```jsonc
{
  "today":    { "count": 0, "totalCostCents": 0, "avgCostCents": 0 },
  "last7d":   { "count": 0, "totalCostCents": 0, "avgCostCents": 0 },
  "last30d":  { "count": 0, "totalCostCents": 0, "avgCostCents": 0 },
  "allTime":  { "count": 0, "totalCostCents": 0, "avgCostCents": 0 }
}
```

The buckets are computed in a single SQL pass via filtered aggregates
(`COUNT/SUM/AVG ... FILTER (WHERE ...)`). "Today" begins at the current
UTC midnight; the rolling windows are `now() - N days`. Rows with
`total_cost_cents IS NULL` are excluded from every bucket so cache-hit /
pre-#22 rows don't poison the averages.

## Cost-reduction levers (disabled by default)

Three scaffolded levers live in `server/appraisal/levers/`. Each one is
gated by a flag in `server/appraisal/cost-levers.config.ts`. **All flags
default OFF.** Flipping a flag must be done deliberately after an A/B run
of the cost-monitoring script — the lever files themselves say so at the
top.

| Lever module | Env flag | Effect when on |
| --- | --- | --- |
| `levers/prompt-cache.ts` | `APPRAISAL_LEVER_PROMPT_CACHE=1` | Attaches `cache_control: { type: "ephemeral" }` to the largest Stage 1 system block so re-runs pay the cheap cache-read rate. |
| `levers/fetch-cap.ts` | `APPRAISAL_LEVER_MAX_FETCHES=<n>` | Caps Stage 1 `web_fetch` tool calls to `n`, bounding fetched-HTML input tokens. Unset = no cap. |
| `levers/strip-html.ts` | `APPRAISAL_LEVER_STRIP_LISTING_HTML=1` | Pre-strips nav/footer/script/style/comments from listing HTML before it is fed back into Claude. |

Each lever exports a pure helper (`maybeApplyPromptCache`,
`shouldAllowFetch` / `remainingFetchBudget`, `stripListingHtml`) that is a
no-op when its flag is off.

### Runtime wiring

The flags are read by `loadCostLeverFlags()` at the call sites that
actually shape Anthropic billing:

- **`callClaude()` in `server/appraisal/claude.ts`** reads the flags on
  every call.
  - `APPRAISAL_LEVER_PROMPT_CACHE=1` → the **Stage 1** `system` parameter
    is sent as a `[{ type: "text", text, cache_control: { type: "ephemeral" } }]`
    array instead of a plain string. Scoped to Stage 1 (the large research
    prompt); Stage 2's small per-appraisal system prompt stays a plain
    string even when the flag is on.
  - `APPRAISAL_LEVER_MAX_FETCHES=<n>` → Stage 1's `web_fetch` tool is
    built with `max_uses = min(n, 25)`; unset keeps the default of 25.
- **`runStage1()` in `server/appraisal/stage1-research.ts`** applies
  `APPRAISAL_LEVER_STRIP_LISTING_HTML=1` to Firecrawl fallback payloads
  before they are re-injected into Claude's context. Anthropic's native
  `web_fetch` tool runs server-side and its results never re-enter our
  process, so the fallback path is the only listing-HTML surface the
  application controls; stripping there covers 100% of the HTML the
  lever can act on.

When every flag is unset, the request shape is byte-for-byte identical to
the pre-Task-#22 behavior. Unit tests in `__tests__/cost.test.ts` exercise
both off (no-op) and on (transform) cases via a mock Anthropic client that
records the outgoing request.

### Multi-call Stage 1 usage aggregation

`runStage1()` may issue **two** Claude calls when the Firecrawl fallback
fires (a blocked `web_fetch` triggers a re-ask with the fetched HTML).
Both calls' `usage` objects are summed into `Stage1Result.aggregatedUsage`
and persisted by the orchestrator as `stage1_input_tokens` /
`stage1_output_tokens`. Cost accounting is therefore exact even on the
fallback path — the first call's tokens are never dropped. Coverage lives
in `__tests__/cost.test.ts` ("runStage1 aggregates usage across initial +
Firecrawl-fallback Claude calls").
