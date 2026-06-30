/**
 * Cost-reduction lever feature flags (Task #22).
 *
 * Three levers were identified as the highest-value ways to drop the per-
 * appraisal Anthropic cost. They are all scaffolded as self-contained
 * modules behind explicit feature flags, **DISABLED BY DEFAULT**. Flipping
 * a flag must be done deliberately after running the cost-monitoring script
 * for an A/B comparison.
 *
 * Lever flags:
 *
 *   APPRAISAL_LEVER_PROMPT_CACHE          ("1" → enabled, default off)
 *     Adds Anthropic `cache_control: { type: "ephemeral" }` markers to the
 *     Stage 1 system prompt so repeat appraisals on similar vehicles pay
 *     the cheap cache-read rate instead of full input rate.
 *
 *   APPRAISAL_LEVER_MAX_FETCHES           (positive integer → cap, default unset = no cap)
 *     Caps the number of `web_fetch` tool invocations Claude is allowed in
 *     Stage 1 — directly bounds the amount of fetched HTML pulled into
 *     the input token count.
 *
 *   APPRAISAL_LEVER_STRIP_LISTING_HTML    ("1" → enabled, default off)
 *     Pre-processes listing-page HTML returned by `web_fetch` to drop
 *     nav/footer/script/style/ads, shrinking the follow-up message size.
 */

export interface CostLeverFlags {
  promptCacheEnabled: boolean;
  /** undefined = no cap; positive integer = max number of web_fetch calls. */
  fetchCap: number | undefined;
  stripListingHtmlEnabled: boolean;
}

/** Read the lever flags from process.env. Pure — call sites pass the result
 * through; tests can construct a `CostLeverFlags` literal directly. */
export function loadCostLeverFlags(env: NodeJS.ProcessEnv = process.env): CostLeverFlags {
  const fetchRaw = env.APPRAISAL_LEVER_MAX_FETCHES;
  const fetchN = fetchRaw ? Number(fetchRaw) : NaN;
  const fetchCap = Number.isFinite(fetchN) && fetchN > 0 ? Math.floor(fetchN) : undefined;
  return {
    promptCacheEnabled: env.APPRAISAL_LEVER_PROMPT_CACHE === "1",
    fetchCap,
    stripListingHtmlEnabled: env.APPRAISAL_LEVER_STRIP_LISTING_HTML === "1",
  };
}
