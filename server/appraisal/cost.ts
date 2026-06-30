/**
 * Per-appraisal Anthropic cost tracking (Task #22).
 *
 * Pure cost-computation helpers. Token usage is captured by `claude.ts`,
 * persisted by the orchestrator, and rendered in the staff UI. All cost
 * values are stored and exchanged in **USD cents** (integer) so they round-
 * trip cleanly through Postgres without floating-point drift.
 */

/** Per-million-token USD pricing for one Anthropic model. */
export interface ModelPricing {
  /** USD per 1M base input tokens (no cache). */
  inputPerMTok: number;
  /** USD per 1M output tokens. */
  outputPerMTok: number;
  /** USD per 1M tokens written into the prompt cache. */
  cacheCreatePerMTok: number;
  /** USD per 1M tokens read from the prompt cache. */
  cacheReadPerMTok: number;
}

/**
 * Pricing table keyed by Anthropic model id. Update here when Anthropic
 * adjusts public pricing; everything downstream reads through
 * `priceForModel()`.
 *
 * Source: https://www.anthropic.com/pricing (claude-opus-4-5).
 */
export const PRICING: Record<string, ModelPricing> = {
  "claude-opus-4-5": {
    inputPerMTok: 15,
    outputPerMTok: 75,
    cacheCreatePerMTok: 18.75,
    cacheReadPerMTok: 1.5,
  },
  // Fallback used when we get an unknown model id back — same as opus so we
  // never silently undercount.
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

export interface CostInputs {
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cacheCreationTokens?: number | null;
  cacheReadTokens?: number | null;
}

/**
 * Compute the Anthropic cost of one stage call in **USD cents** (integer).
 *
 * Pure function. Returns 0 for an all-null/zero usage record. Rounds to
 * the nearest cent so very cheap calls still register as ≥1¢ rather than
 * silently dropping to zero.
 */
export function computeAnthropicCostCents(usage: CostInputs): number {
  const p = priceForModel(usage.model);
  const inTok = usage.inputTokens ?? 0;
  const outTok = usage.outputTokens ?? 0;
  const cacheCreate = usage.cacheCreationTokens ?? 0;
  const cacheRead = usage.cacheReadTokens ?? 0;
  const dollars =
    (inTok * p.inputPerMTok +
      outTok * p.outputPerMTok +
      cacheCreate * p.cacheCreatePerMTok +
      cacheRead * p.cacheReadPerMTok) /
    1_000_000;
  // dollars → cents (1/100 USD), rounded.
  return Math.round(dollars * 100);
}

/** Format USD cents as a human-readable string. 237 → "$2.37". */
export function formatCentsAsUsd(cents: number | null | undefined): string {
  if (cents == null) return "—";
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}
