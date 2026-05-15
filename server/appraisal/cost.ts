/**
 * Per-appraisal Anthropic cost tracking (Task #22).
 *
 * Captures token counts from each Claude call, computes a per-appraisal
 * cost in mills (1/1000 USD), and exposes pricing helpers for the cost
 * summary endpoint. Also documents — but does not yet apply — three cost-
 * reduction levers that we can flip on later via env vars.
 */

/**
 * Per-million-token USD pricing for the Anthropic models we use.
 *
 * Source: Anthropic public pricing for `claude-opus-4-5` at the time of
 * writing. Update here when pricing changes; everything downstream reads
 * through `priceForModel()`.
 */
export interface ModelPricing {
  /** USD per 1M base input tokens (no cache). */
  inputPerMTok: number;
  /** USD per 1M output tokens. */
  outputPerMTok: number;
  /** USD per 1M tokens written into the prompt cache (write/creation). */
  cacheCreatePerMTok: number;
  /** USD per 1M tokens read from the prompt cache. */
  cacheReadPerMTok: number;
}

const PRICING: Record<string, ModelPricing> = {
  "claude-opus-4-5": {
    inputPerMTok: 15,
    outputPerMTok: 75,
    cacheCreatePerMTok: 18.75,
    cacheReadPerMTok: 1.5,
  },
  // Fallback used when we get an unknown model id back — same as opus pricing
  // so we never silently undercount. Update when adding new models.
  default: {
    inputPerMTok: 15,
    outputPerMTok: 75,
    cacheCreatePerMTok: 18.75,
    cacheReadPerMTok: 1.5,
  },
};

export function priceForModel(model: string | null | undefined): ModelPricing {
  if (!model) return PRICING.default;
  return PRICING[model] ?? PRICING.default;
}

export interface StageUsage {
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cacheCreationTokens?: number | null;
  cacheReadTokens?: number | null;
}

/**
 * Compute the cost of a single stage in **mills** (1/1000 USD).
 *
 * Rounds half-up so very cheap stages still register as ≥1 mill rather
 * than silently dropping to zero.
 */
export function stageCostMills(usage: StageUsage): number {
  const p = priceForModel(usage.model);
  const inTok = usage.inputTokens ?? 0;
  const outTok = usage.outputTokens ?? 0;
  const cacheCreate = usage.cacheCreationTokens ?? 0;
  const cacheRead = usage.cacheReadTokens ?? 0;
  // dollars = tokens * (USD per 1M) / 1_000_000
  const dollars =
    (inTok * p.inputPerMTok +
      outTok * p.outputPerMTok +
      cacheCreate * p.cacheCreatePerMTok +
      cacheRead * p.cacheReadPerMTok) /
    1_000_000;
  // dollars → mills (1/1000 USD)
  return Math.round(dollars * 1000);
}

export function totalCostMills(stages: StageUsage[]): number {
  return stages.reduce((acc, s) => acc + stageCostMills(s), 0);
}

/** Format mills as a USD string for display. 2300 → "$2.30". */
export function formatMillsAsUsd(mills: number | null | undefined): string {
  if (mills == null) return "—";
  const dollars = mills / 1000;
  return `$${dollars.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Cost-reduction levers (SCAFFOLDED — DISABLED BY DEFAULT)
//
// These are documented and read here so we can flip them on later via env
// without further code changes. Wiring them into the pipeline is intentionally
// deferred — the lever helpers are pure config readers for now.
//
//   APPRAISAL_ENABLE_PROMPT_CACHE     (default "0") — when "1", Stage 1
//     should attach `cache_control: { type: "ephemeral" }` to the system
//     prompt so repeat appraisals on similar vehicles pay the cache-read
//     rate instead of the full input rate.
//
//   APPRAISAL_FETCH_MAX_USES          (default "25") — caps the number of
//     `web_fetch` tool invocations Claude is allowed to make per Stage 1
//     call. Lowering this directly reduces the amount of fetched HTML
//     pulled into the input token count.
//
//   APPRAISAL_STRIP_HTML              (default "0") — when "1", the
//     Firecrawl fallback should strip <script>/<style>/HTML tags before
//     feeding the page back into Claude, dramatically shrinking the
//     follow-up message size.
// ---------------------------------------------------------------------------

export interface CostLevers {
  promptCacheEnabled: boolean;
  fetchMaxUses: number;
  stripHtmlEnabled: boolean;
}

export function loadCostLevers(): CostLevers {
  const fetchMaxRaw = process.env.APPRAISAL_FETCH_MAX_USES;
  const fetchMax = fetchMaxRaw ? Number(fetchMaxRaw) : 25;
  return {
    promptCacheEnabled: process.env.APPRAISAL_ENABLE_PROMPT_CACHE === "1",
    fetchMaxUses: Number.isFinite(fetchMax) && fetchMax > 0 ? Math.floor(fetchMax) : 25,
    stripHtmlEnabled: process.env.APPRAISAL_STRIP_HTML === "1",
  };
}
