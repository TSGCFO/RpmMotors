/**
 * DISABLED BY DEFAULT — do not enable without an A/B comparison run via
 * the cost-monitoring script.
 *
 * Lever 1 — Stage 1 system-prompt caching (Task #22).
 *
 * When enabled, this module rewrites the Stage 1 system blocks so the last
 * (largest) block carries an Anthropic `cache_control: { type: "ephemeral" }`
 * marker. Anthropic will then bill the cached portion at the cache-read
 * rate ($1.50/Mtok for opus-4-5) instead of the full input rate
 * ($15/Mtok) on subsequent appraisals that re-use the same prompt.
 *
 * Call site is expected to be in `claude.ts` when building the Stage 1
 * request. Until the lever flag is flipped, callers should keep passing
 * the system blocks through unchanged.
 */

export interface SystemBlock {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
}

/**
 * Returns the system blocks unchanged when the lever is off. When the
 * lever is on, attaches `cache_control: { type: "ephemeral" }` to the
 * single largest text block (so the rolling cached prefix is the heaviest
 * piece of the prompt).
 *
 * Pure: never mutates the input array.
 */
export function maybeApplyPromptCache(
  blocks: SystemBlock[],
  enabled: boolean,
): SystemBlock[] {
  if (!enabled) return blocks;
  if (blocks.length === 0) return blocks;

  // Pick the index of the longest text block.
  let largestIdx = 0;
  let largestLen = blocks[0].text.length;
  for (let i = 1; i < blocks.length; i++) {
    const len = blocks[i].text.length;
    if (len > largestLen) {
      largestLen = len;
      largestIdx = i;
    }
  }

  return blocks.map((b, i) =>
    i === largestIdx
      ? { ...b, cache_control: { type: "ephemeral" as const } }
      : b,
  );
}
