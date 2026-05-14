/**
 * Stage 2 — Final appraisal.
 *
 * - No web access.
 * - Computes the comp-derived anchor + multiplier chain server-side using
 *   `adjustments.config.ts` (no magic numbers anywhere else).
 * - Asks Claude only to (a) write a customer-friendly narrative and price
 *   factors and (b) echo the resulting structured output, rounded to $50.
 * - Validates against Stage2OutputSchema; if the model returns an
 *   `estimatedPriceCad` more than $50 off the server's pre-round number, we
 *   override with the server-computed value to keep math deterministic.
 */

import { callClaude, parseJsonFromText, type ClaudeCallResult } from "./claude";
import {
  STAGE2_SYSTEM_PROMPT,
  Stage2OutputSchema,
  type Stage2Output,
} from "./prompts";
import { type Stage1Output } from "./prompts";
import {
  ADJUSTMENTS,
  accidentMultiplier,
  classifyConfidence,
  conditionMultiplier,
  cpiNudgePct,
  featureBumpDollars,
  medianAnchor,
  mileageAdjustmentPct,
  ownersMultiplier,
  roundToNearest,
  seasonalMultiplier,
  serviceRecordsMultiplier,
} from "./adjustments.config";

export interface Stage2Input {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  mileageKm: number;
  bodyType?: string | null;
  conditionRating?: string | null;
  accidentHistory?: string | null;
  ownerCount?: string | number | null;
  serviceRecords?: string | null;
  features?: readonly string[];
  /** 1-12; defaults to current month. */
  appraisalMonth?: number;
  /** Vehicle age in years (current_year - year). */
  vehicleAgeYears?: number;
}

export interface Stage2Options {
  config?: Parameters<typeof callClaude>[0]["config"];
  client?: Parameters<typeof callClaude>[0]["client"];
}

export interface Stage2Result {
  output: Stage2Output;
  modelUsed: string;
  durationMs: number;
  raw: ClaudeCallResult;
}

export interface InternalBreakdown {
  anchorCad: number;
  mileageAdjustPct: number;
  conditionMult: number;
  accidentMult: number;
  ownersMult: number;
  serviceRecordsMult: number;
  seasonalMult: number;
  featureBumpCad: number;
  cpiNudgePct: number;
  preRoundCad: number;
  compsUsedCount: number;
}

/** Map customer-supplied accident-history free text to an accident signal key. */
function classifyOwnAccidentText(text: string | null | undefined): string {
  if (!text) return "unknown";
  const s = text.toLowerCase();
  if (/\brebuilt|salvage|branded\b/.test(s)) return "rebuilt";
  if (/\b(major|frame|airbag|structural|write[- ]off)\b/.test(s)) return "major";
  if (/\b(minor|cosmetic|bumper|small)\b/.test(s)) return "minor";
  if (/\b(no accident|clean|never|no claims?)\b/.test(s)) return "clean";
  return "unknown";
}

export function computeInternalBreakdown(
  subject: Stage2Input,
  stage1: Stage1Output,
): InternalBreakdown {
  const usedComps = stage1.comps.filter((c) => {
    const sig = (c.accidentSignalFromDescription || "unknown").toLowerCase();
    return sig !== "major" && sig !== "rebuilt";
  });
  const anchor = medianAnchor(stage1.comps);

  const ageYears =
    subject.vehicleAgeYears ?? Math.max(1, new Date().getFullYear() - subject.year);
  const mileageAdjustPct = mileageAdjustmentPct(subject.mileageKm, ageYears);

  const conditionMult = conditionMultiplier(subject.conditionRating);
  const accidentSignal = classifyOwnAccidentText(subject.accidentHistory);
  const accidentMult = accidentMultiplier(accidentSignal);
  const ownersMult = ownersMultiplier(subject.ownerCount);
  const serviceMult = serviceRecordsMultiplier(subject.serviceRecords);
  const month = subject.appraisalMonth ?? new Date().getMonth() + 1;
  const seasonalMult = seasonalMultiplier(subject.bodyType, month);
  const cpiPct = cpiNudgePct(stage1.statCanCpi3MonthDirection);

  // Apply adjustments in the order specified in the design:
  // mileage delta → condition → accident → owners → service → seasonal → features (cap) → CPI nudge.
  let price = anchor;
  price = price * (1 + mileageAdjustPct);
  price = price * conditionMult;
  price = price * accidentMult;
  price = price * ownersMult;
  price = price * serviceMult;
  price = price * seasonalMult;
  const featureBump = featureBumpDollars(subject.features ?? [], price);
  price = price + featureBump;
  price = price * (1 + cpiPct);

  return {
    anchorCad: Math.round(anchor),
    mileageAdjustPct: Number(mileageAdjustPct.toFixed(4)),
    conditionMult,
    accidentMult,
    ownersMult,
    serviceRecordsMult: serviceMult,
    seasonalMult,
    featureBumpCad: Math.round(featureBump),
    cpiNudgePct: Number(cpiPct.toFixed(4)),
    preRoundCad: Math.round(price),
    compsUsedCount: usedComps.length,
  };
}

function buildStage2UserPrompt(
  subject: Stage2Input,
  stage1: Stage1Output,
  breakdown: InternalBreakdown,
  confidence: "high" | "medium" | "low",
): string {
  const compact = {
    subject: {
      year: subject.year,
      make: subject.make,
      model: subject.model,
      trim: subject.trim ?? null,
      mileageKm: subject.mileageKm,
      conditionRating: subject.conditionRating ?? null,
      accidentHistory: subject.accidentHistory ?? null,
      ownerCount: subject.ownerCount ?? null,
      serviceRecords: subject.serviceRecords ?? null,
      bodyType: subject.bodyType ?? null,
      features: subject.features ?? [],
    },
    stage1Summary: {
      compsCount: stage1.compsCount,
      compsBandUsed: stage1.compsBandUsed,
      statCanCpi3MonthDirection: stage1.statCanCpi3MonthDirection,
      researchNotes: stage1.researchNotes,
      compsPreview: stage1.comps.slice(0, 12).map((c) => ({
        url: c.url,
        title: c.title,
        askingPriceCad: c.askingPriceCad,
        mileageKm: c.mileageKm,
        accidentSignalFromDescription: c.accidentSignalFromDescription,
        trim: c.trim,
      })),
    },
    internalBreakdown: breakdown,
    confidenceGuidance: confidence,
    roundingStepCad: ADJUSTMENTS.roundToCad,
  };
  return [
    "INPUTS (do NOT recompute anchor / adjustments):",
    JSON.stringify(compact, null, 2),
    "",
    `Produce the final JSON. estimatedPriceCad MUST equal preRoundCad rounded to the nearest ${ADJUSTMENTS.roundToCad}.`,
    `confidence MUST equal "${confidence}".`,
    "Echo internalBreakdown unchanged.",
  ].join("\n");
}

export async function runStage2(
  subject: Stage2Input,
  stage1: Stage1Output,
  options: Stage2Options = {},
): Promise<Stage2Result> {
  const started = Date.now();
  const breakdown = computeInternalBreakdown(subject, stage1);
  const confidence = classifyConfidence(breakdown.compsUsedCount);
  const userPrompt = buildStage2UserPrompt(subject, stage1, breakdown, confidence);

  const response = await callClaude({
    system: STAGE2_SYSTEM_PROMPT,
    user: userPrompt,
    stage: "stage2",
    config: options.config,
    client: options.client,
  });

  const parsed = parseJsonFromText<unknown>(response.text);
  const validated = Stage2OutputSchema.parse(parsed);

  // Deterministic safety net: force the price to the server-computed,
  // properly-rounded number regardless of what the model echoed.
  const expectedPrice = roundToNearest(breakdown.preRoundCad, ADJUSTMENTS.roundToCad);
  const safeOutput: Stage2Output = {
    ...validated,
    estimatedPriceCad: expectedPrice,
    confidence,
    internalBreakdown: breakdown,
  };

  return {
    output: safeOutput,
    modelUsed: response.model,
    durationMs: Date.now() - started,
    raw: response,
  };
}
