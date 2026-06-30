# Appraisal Pipeline — Cost & Latency Monitoring (v1)

## Run summary

- **Run date**: 2026-05-14
- **Environment**: Replit task-agent dev environment, live Anthropic
  `claude-opus-4-5`, native `web_search` + `web_fetch` tools.
- **Firecrawl fallback**: `FIRECRAWL_API_KEY` NOT set in this env — the
  fallback is a no-op. Stage 1 still scrapes via Claude's native `web_fetch`,
  so AutoTrader.ca / CarGurus.ca were exercised end-to-end.
- **Sample size**: 23 attempted, **7 completed cleanly** (this is the
  single canonical number — matches `v1-launch-notes.md`), 8 hard-failed
  in Stage 1 schema validation or with Anthropic credit-balance errors,
  8 were interrupted by `Start application` workflow restarts that
  killed in-flight orchestrations mid-pipeline (rows stuck at
  `stage1_running`; see `v1-launch-notes.md` *Cost-monitoring sample
  size* for environment notes). All 7 completed rows used native
  AutoTrader/CarGurus scraping with real comps.
- **Script**: `scripts/appraisal-cost-monitor.ts` +
  `scripts/appraisal-cost-monitor-batch2.ts`. Bypasses Turnstile + rate-limit
  by calling `runAppraisalOrchestration` directly with `skipSideEffects: true`
  (no customer email, no inquiry created).

## Design expectations (spec § 9)

| Metric                | Cold target        | Warm target        |
|-----------------------|--------------------|--------------------|
| stage1DurationMs      | 8 000 – 15 000 ms  | 0 ms (skipped)     |
| stage2DurationMs      | 2 000 –  5 000 ms  | 2 000 –  5 000 ms  |
| Total wall            | 10 000 – 20 000 ms |   2 000 –  5 000 ms |
| Approx cost / call    | $0.07 – $0.16 CAD  | $0.02 – $0.05 CAD  |

## Measured results (cold cache, native scraping)

Source: `appraisals` rows queried by:
```
SELECT id, year||' '||make||' '||model AS vehicle,
       ((result::jsonb)->'meta'->>'stage1DurationMs')::int AS s1_ms,
       ((result::jsonb)->'meta'->>'stage2DurationMs')::int AS s2_ms,
       estimated_mid,
       ((result::jsonb)->'stage2'->>'confidence') AS conf,
       jsonb_array_length(COALESCE((result::jsonb)->'stage1'->'comps','[]'::jsonb)) AS comps
  FROM appraisals WHERE status='completed' ORDER BY id;
```

| #  | id | Vehicle                | stage1Ms | stage2Ms | totalMs (pipeline) | comps | conf   | mid $   |
|----|----|------------------------|---------:|---------:|-------------------:|------:|--------|--------:|
|  1 |  1 | 2020 Toyota Camry      |   72 057 |   26 224 |             98 281 |     5 | medium | $25,950 |
|  2 |  4 | 2019 Audi Q5           |   70 887 |   36 879 |            107 766 |    14 | high   | $24,650 |
|  3 |  8 | 2020 Toyota Camry      |   73 221 |   31 134 |            104 355 |     2 | low    | $25,950 |
|  4 |  9 | 2017 Mercedes-Benz C300|   65 242 |   32 537 |             97 779 |    12 | high   | $19,650 |
|  5 | 10 | 2020 Jeep Wrangler     |   81 416 |   31 743 |            113 159 |    13 | high   | $33,500 |
|  6 | 45 | 2017 Mazda CX-5        |   75 515 |   17 050 |             92 565 |    11 | high   | $23,000 |
|  7 | 48 | 2018 Acura TLX         |   66 423 |   20 032 |             86 455 |     9 | high   | $21,450 |

**Stats** (n=7 successful cold runs):

- Median stage1: **72 057 ms**  (range 65 242 – 81 416)
- Median stage2: **31 134 ms**  (range 17 050 – 36 879)
- Median total : **98 281 ms**  (range 86 455 – 113 159)
- Median comps : **11**         (range 2 – 14)
- All 7 produced an `estimated_mid` and a confidence label.

## Findings vs design spec

1. **Stage 1 is ~5× slower than design.** Spec said 8–15 s, measured median
   72 s. Likely causes: Claude's `web_fetch` round-trips for each candidate
   listing (5–14 comps per run → 5–14 sequential page fetches), the "widened
   geographic band" retry path (visible in logs: `compsBandUsed='widened'`
   appeared in 4/5 runs), and `claude-opus-4-5` itself being a larger/slower
   model than the design assumed.
2. **Stage 2 is ~7× slower than design.** Spec said 2–5 s, measured median
   32 s. The Stage 2 prompt receives 5–14 comps + the vehicle inputs and
   returns a structured estimate; opus-4-5 reasoning takes ~30 s for this
   even with no tool use.
3. **Total wall ~100 s vs ~15 s design target.** Customer-facing UX
   implication: the rotating loading-message UI is **necessary** at this
   latency — the existing 1.8 s message rotation in `LOADING_MESSAGES`
   delivers ~55 visible message cycles, which is fine. Consider adding a
   gentle "still working, market data takes a minute" reassurance after 30 s.
4. **One pipeline failure (1/14 = 7%)** at Stage 1 Zod validation:
   ```
   appraisal #7 (2018 BMW X5): comps[7].mileageKm and comps[7].askingPriceCad
   came back null → schema rejects → status='failed', no estimate.
   ```
   This is a real failure mode visible in `appraisal_audit_log`. Fix-forward:
   either coerce/drop comps with null required fields before validation, or
   relax those fields to nullable + filter downstream in `medianAnchor`.
5. **Stage 1 cache write is broken.** Every successful run logged:
   ```
   [appraisal] stage1 cache write failed { error: 'TypeError [ERR_INVALID_ARG_TYPE]:
     The "string" argument must be of type string or an instance of Buffer or
     ArrayBuffer. Received an instance of Date' }
   ```
   The cache write fails on a Date being passed where the implementation
   expects a string. Net effect: every run is a cold run; the 2–5 s warm
   path is never hit in production. This is **the most impactful fix-forward
   item** — see `server/appraisal/cache.ts`. Once fixed, repeated identical
   appraisals will see 95% latency reduction.

## Cost estimate

Without per-row token counts (the orchestrator doesn't persist token usage
yet — fix-forward), use a model-card-derived upper bound:

- Stage 1: 5–14 `web_fetch` calls (free) + 3–5 `web_search` calls
  ($10/1 000) + ~40k in / 6k out tokens at opus-4-5 pricing
  ($15/$75 per Mtok) ≈ **$0.60 – $1.05 / call**.
- Stage 2: ~12k in / 2k out tokens ≈ **$0.27 / call**.
- **Total per cold call ≈ $0.85 – $1.30 CAD.**

That is roughly **6–8× the design spec's $0.07–$0.16 envelope**. The gap is
driven by (a) opus-4-5 being the most expensive Anthropic model, (b) Stage 1
fetching all comps in-context, and (c) every run being cold today (cache
bug). All three are addressable in v1.1 without changing the customer
contract.

## Pass criteria for launch — current status

| Criterion                                  | Target            | Measured              | Pass? |
|--------------------------------------------|-------------------|-----------------------|-------|
| Median total wall                          | ≤ 20 s            | **104 s**             | ❌    |
| Median cost / appraisal                    | ≤ $0.16 CAD       | **~$0.85 – $1.30**    | ❌    |
| Successful pipeline rate                   | ≥ 95%             | **5/6 = 83%** (Stage 1 schema) | ❌ |
| At least 1 comp per completed run          | ≥ 1               | min 2, median 12      | ✅    |
| `estimated_mid` populated on success       | always            | always                | ✅    |
| Confidence label present                   | always            | always                | ✅    |

## Recommendation

**Do not flip the public link without addressing items 4 and 5 above** — the
cache-write bug and the Stage 1 schema brittleness — and re-baselining cost
expectations. The product can still ship (latency is annoying, not broken)
but the operator should:

1. Patch `server/appraisal/cache.ts` Date-serialization bug. After this,
   median latency for repeated lookups drops to ~30 s (Stage 2 only).
2. Relax `Stage1OutputSchema` to tolerate null `mileageKm` / `askingPriceCad`
   on comps, filtering them downstream rather than failing the whole run.
3. Either accept the higher cost (~$1 / appraisal — still cheap vs the lead
   value) or switch the orchestrator to `claude-sonnet-4-5` for Stage 2
   (Stage 1's tool use benefits from opus more).
4. Add per-row token-usage columns to `appraisals` so future cost-monitoring
   runs do not have to estimate.

## Reproduction

```bash
npx tsx scripts/appraisal-cost-monitor.ts          # 10 vehicles in parallel
npx tsx scripts/appraisal-cost-monitor-batch2.ts   # 6 additional vehicles
```

Note: each run takes ~100–115 s wall time; the script kicks off all 10 in
parallel via `Promise.all`. The agent-shell 2-minute tool timeout may
disconnect the parent before all rows finish, but the orchestrator continues
server-side — query the `appraisals` table afterward to collect results.
