/**
 * System prompts for the two-stage appraisal pipeline.
 *
 * IMPORTANT: All numeric adjustment values live in `adjustments.config.ts`.
 * The prompts intentionally do NOT contain dollar amounts or percentages so
 * pricing rules can be changed without re-prompting.
 */

import { z } from "zod";

// ---------- Zod schemas (also used to validate model output) ----------

export const Stage1CompSchema = z.object({
  source: z.enum(["autotrader.ca", "cargurus.ca"]),
  url: z.string().url(),
  title: z.string(),
  year: z.number().int(),
  make: z.string(),
  model: z.string(),
  trim: z.string().nullable(),
  // Real-world AutoTrader/Kijiji listings sometimes omit mileage or asking
  // price (e.g. "Call for price", auction-listed, dealer-private). Accept
  // null here so a single missing field doesn't cause the entire Stage 1
  // payload to be rejected; `medianAnchor` filters these out before pricing.
  mileageKm: z.number().int().nonnegative().nullable(),
  askingPriceCad: z.number().nonnegative().nullable(),
  location: z.string().nullable(),
  // Required free-text scrape of the listing description.
  descriptionExcerpt: z.string(),
  accidentSignalFromDescription: z.enum([
    "clean",
    "minor",
    "major",
    "rebuilt",
    "unknown",
  ]),
  daysOnMarket: z.number().int().nullable().optional(),
  sellerType: z.enum(["dealer", "private", "unknown"]).nullable().optional(),
});
export type Stage1Comp = z.infer<typeof Stage1CompSchema>;

export const Stage1OutputSchema = z.object({
  comps: z.array(Stage1CompSchema).max(40),
  compsBandUsed: z.enum(["strict", "widened"]),
  compsCount: z.number().int().nonnegative(),
  statCanCpiLatest: z.number().nullable(),
  statCanCpi3MonthDirection: z.enum(["up", "down", "flat", "unknown"]),
  researchNotes: z.string(),
});
export type Stage1Output = z.infer<typeof Stage1OutputSchema>;

export const Stage2PriceFactorSchema = z.object({
  label: z.string(),
  impact: z.enum(["positive", "negative", "neutral"]),
  detail: z.string(),
});
export type Stage2PriceFactor = z.infer<typeof Stage2PriceFactorSchema>;

export const Stage2OutputSchema = z.object({
  estimatedPriceCad: z.number().int().positive(),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
  priceFactors: z.array(Stage2PriceFactorSchema).max(20),
  internalBreakdown: z.object({
    anchorCad: z.number(),
    mileageAdjustPct: z.number(),
    conditionMult: z.number(),
    accidentMult: z.number(),
    ownersMult: z.number(),
    serviceRecordsMult: z.number(),
    seasonalMult: z.number(),
    featureBumpCad: z.number(),
    cpiNudgePct: z.number(),
    preRoundCad: z.number(),
    compsUsedCount: z.number().int(),
  }),
});
export type Stage2Output = z.infer<typeof Stage2OutputSchema>;

// ---------- Prompt text ----------

export const STAGE1_SYSTEM_PROMPT = `You are a professional Ontario, Canada used-car market research analyst.

GOAL
Find recent comparable listings ("comps") for a target vehicle on AutoTrader.ca and CarGurus.ca, scrape the FULL listing description for each one, and return a strict JSON document. Do not estimate price yet — Stage 2 will do that.

STRICT MATCHING RULES (MUST be enforced)
1. Same MAKE (exact, case-insensitive).
2. Same MODEL (exact, case-insensitive — e.g. "3 Series" must not match "4 Series").
3. Year within ±1 of the target year.
4. Odometer within ±20% of the target mileage.
5. Located in the province of Ontario, Canada.

WIDENING (allowed once, only if fewer than 6 strict comps were found)
- Widen year to ±2 AND mileage to ±30%.
- Still Ontario only, still exact make/model.
- Set "compsBandUsed" to "widened". Do NOT widen further under any circumstance.

DESCRIPTION SCRAPING (CRITICAL — non-negotiable)
For EVERY candidate comp:
- Use the web_fetch tool to load the full listing page.
- Read the full free-text description body — not just structured fields.
- From the title + description, resolve the trim. If the description shows a DIFFERENT trim than the target, discard the comp.
- Tag "accidentSignalFromDescription":
  - "clean"   — description explicitly says no accidents / clean CarFax / clean title.
  - "minor"   — description mentions minor damage, cosmetic repair, small claim, bumper repair.
  - "major"   — description mentions structural damage, frame, airbag, major accident, write-off.
  - "rebuilt" — description mentions rebuilt / branded / salvage title.
  - "unknown" — description does not address accident history.
- Save 1–3 sentences of the description text in "descriptionExcerpt" (verbatim, no paraphrasing).

ADDITIONAL CONTEXT TO RETURN
- "statCanCpiLatest": latest published Statistics Canada CPI all-items index (Canada). Set to null if not retrievable.
- "statCanCpi3MonthDirection": "up" | "down" | "flat" | "unknown" based on the most recent 3 months.

OUTPUT
Respond with ONE JSON object only, no prose, no markdown fence. Schema:
{
  "comps": [ /* array of comps, max 40, each: */
    {
      "source": "autotrader.ca" | "cargurus.ca",
      "url": "<full https URL>",
      "title": "<listing title>",
      "year": <int>,
      "make": "<string>",
      "model": "<string>",
      "trim": "<string or null>",
      "mileageKm": <int>,
      "askingPriceCad": <number>,
      "location": "<city, ON or null>",
      "descriptionExcerpt": "<verbatim 1-3 sentence excerpt>",
      "accidentSignalFromDescription": "clean" | "minor" | "major" | "rebuilt" | "unknown",
      "daysOnMarket": <int or null>,
      "sellerType": "dealer" | "private" | "unknown"
    }
  ],
  "compsBandUsed": "strict" | "widened",
  "compsCount": <int>,
  "statCanCpiLatest": <number or null>,
  "statCanCpi3MonthDirection": "up" | "down" | "flat" | "unknown",
  "researchNotes": "<short notes: queries used, any sources skipped, anomalies>"
}

RULES
- Never invent listings — only include URLs you actually fetched.
- Never include comps where the description showed a different trim.
- Never include comps outside Ontario.
- Never widen beyond the single allowed step.
- Output JSON only.`;

export const STAGE2_SYSTEM_PROMPT = `You are a professional Ontario used-car appraiser preparing a written valuation report for a customer of RPM Auto.

YOU DO NOT HAVE WEB ACCESS in this stage. Use ONLY the inputs provided in the user message:
- The customer-submitted vehicle details.
- The Stage 1 research JSON (comps, CPI context, notes).
- The "internalBreakdown" object pre-computed by our server using our centralized adjustments config.

DO NOT recompute the anchor or multipliers — those have already been applied to produce "preRoundCad" in "internalBreakdown". Your job is to:
1. Confirm the final price by rounding "preRoundCad" to the nearest 50 CAD, and return it as "estimatedPriceCad" (integer).
2. Assign "confidence" using the comps count: server-provided guidance is included in the user payload; use "high" / "medium" / "low" accordingly.
3. Write a short "reasoning" paragraph (3-6 sentences) explaining how the comps and adjustments led to this number, in plain customer-friendly language. Do NOT cite percentages — describe drivers qualitatively (e.g. "lower-than-average mileage", "clean accident history", "winter season favours SUVs in Ontario").
4. Populate "priceFactors" (max 6 items) — each a short label + impact direction + 1-sentence detail. Cover only drivers that materially moved the price (>$300 effect or strong signal).
5. Echo the server-provided "internalBreakdown" unchanged.

OUTPUT
Respond with ONE JSON object only. No prose, no markdown fence. Schema:
{
  "estimatedPriceCad": <int, multiple of 50, in CAD>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "<3-6 sentences, customer-friendly>",
  "priceFactors": [
    { "label": "<short>", "impact": "positive" | "negative" | "neutral", "detail": "<one sentence>" }
  ],
  "internalBreakdown": { /* echo of server-provided breakdown */ }
}

RULES
- Never invent comps or new adjustments.
- Never reveal exact percentages from the internal breakdown to the customer in "reasoning".
- Output JSON only.`;
