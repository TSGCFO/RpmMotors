/**
 * DISABLED BY DEFAULT — do not enable without an A/B comparison run via
 * the cost-monitoring script.
 *
 * Lever 2 — Cap Stage 1 web_fetch turns (Task #22).
 *
 * The biggest single cost driver in Stage 1 is `web_fetch` pulling full
 * listing-page HTML into Claude's context. This lever wraps the tool
 * call decision so that after `cap` fetches Claude is forced to stop
 * fetching and finalize Stage 1 with whatever evidence it already has.
 *
 * The pure helper below is the policy check. Call site (Stage 1 tool
 * loop) is expected to call `shouldAllowFetch(usedSoFar, cap)` before
 * dispatching each new `web_fetch`. Until the cap is set, this lever is
 * a no-op.
 */

/**
 * Returns true if the next `web_fetch` should be allowed.
 * - When `cap` is `undefined`, no cap is in effect → always true.
 * - When `cap` is set, only the first `cap` fetches are allowed.
 *
 * Pure function.
 */
export function shouldAllowFetch(usedSoFar: number, cap: number | undefined): boolean {
  if (cap === undefined) return true;
  return usedSoFar < cap;
}

/**
 * Convenience: returns the remaining fetch budget given current usage.
 * Returns `Infinity` when no cap is set.
 */
export function remainingFetchBudget(usedSoFar: number, cap: number | undefined): number {
  if (cap === undefined) return Infinity;
  return Math.max(0, cap - usedSoFar);
}
