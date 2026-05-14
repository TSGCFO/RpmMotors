/**
 * Centralized numeric configuration for the appraisal pipeline.
 *
 * All adjustment multipliers, feature dollar values, and the seasonal table
 * live here so prompts and code can stay free of magic numbers. Stage 2 reads
 * these values when computing the final estimate.
 *
 * Multipliers are expressed as decimals applied to the comp-derived anchor
 * price (e.g. 1.04 = +4%, 0.96 = -4%).
 */

export type ConditionRating = "excellent" | "good" | "fair" | "poor";
export type AccidentSignal = "clean" | "minor" | "major" | "rebuilt" | "unknown";
export type OwnerCount = "1" | "2" | "3+" | "unknown";
export type ServiceRecords = "full" | "partial" | "none" | "unknown";
export type BodyType =
  | "sedan"
  | "coupe"
  | "hatchback"
  | "wagon"
  | "suv"
  | "truck"
  | "van"
  | "convertible"
  | "other";

export interface MileageDeltaCurve {
  /** Expected annual km used to derive the reference mileage for the comp band. */
  expectedAnnualKm: number;
  /**
   * Adjustment in decimal per 10,000 km over/under the expected mileage.
   * Positive when subject mileage is BELOW expected (price up); negative
   * when ABOVE. Capped by maxAdjustPct (absolute).
   */
  perTenKkmPct: number;
  /** Hard cap on the absolute mileage adjustment, as a decimal. */
  maxAdjustPct: number;
}

export interface FeatureDollarValues {
  /** Per-feature dollar bumps applied additively, then capped. */
  values: Record<string, number>;
  /** Cap on total feature bump as a percent of anchor price (decimal). */
  capPct: number;
}

export interface CpiNudge {
  /** Absolute adjustment when 3-month CPI direction is up. */
  upPct: number;
  /** Absolute adjustment when 3-month CPI direction is down. */
  downPct: number;
  /** No-op when flat / unknown. */
  flatPct: number;
}

export interface AdjustmentsConfig {
  condition: Record<ConditionRating, number>;
  accident: Record<AccidentSignal, number>;
  /** Weight applied to a comp's asking price when its description shows a minor accident. */
  minorAccidentCompWeight: number;
  owners: Record<OwnerCount, number>;
  serviceRecords: Record<ServiceRecords, number>;
  mileage: MileageDeltaCurve;
  features: FeatureDollarValues;
  /**
   * Seasonal multipliers indexed by body type, then by month (1-12).
   * Defaults to 1.0 when missing.
   */
  seasonal: Partial<Record<BodyType, Partial<Record<number, number>>>>;
  cpi: CpiNudge;
  /** Final price is rounded to the nearest multiple of this many CAD. */
  roundToCad: number;
  /** Confidence rule: minimum number of comps required for "high" confidence. */
  highConfidenceMinComps: number;
  /** Below this comp count the result is "low" confidence. */
  lowConfidenceMaxComps: number;
}

export const ADJUSTMENTS: AdjustmentsConfig = {
  condition: {
    excellent: 1.06,
    good: 1.0,
    fair: 0.93,
    poor: 0.82,
  },
  accident: {
    clean: 1.0,
    minor: 0.95,
    major: 0.82,
    rebuilt: 0.65,
    unknown: 0.98,
  },
  minorAccidentCompWeight: 0.5,
  owners: {
    "1": 1.02,
    "2": 1.0,
    "3+": 0.97,
    unknown: 1.0,
  },
  serviceRecords: {
    full: 1.03,
    partial: 1.0,
    none: 0.97,
    unknown: 1.0,
  },
  mileage: {
    expectedAnnualKm: 20000,
    perTenKkmPct: 0.015,
    maxAdjustPct: 0.15,
  },
  features: {
    values: {
      navigation: 250,
      sunroof: 400,
      "panoramic-roof": 700,
      "heated-seats": 250,
      "cooled-seats": 400,
      "leather-seats": 600,
      "premium-audio": 500,
      "adaptive-cruise": 500,
      "blind-spot": 300,
      "360-camera": 500,
      "tow-package": 600,
      "all-wheel-drive": 800,
      "4-wheel-drive": 800,
      "remote-start": 200,
      "winter-tires": 600,
      "extra-set-of-wheels": 800,
      "ceramic-coating": 400,
      "extended-warranty": 1200,
    },
    capPct: 0.08,
  },
  seasonal: {
    convertible: { 4: 1.03, 5: 1.05, 6: 1.06, 7: 1.06, 8: 1.04, 11: 0.96, 12: 0.94, 1: 0.94, 2: 0.95 },
    suv: { 11: 1.03, 12: 1.04, 1: 1.04, 2: 1.03, 6: 0.98, 7: 0.97 },
    truck: { 11: 1.02, 12: 1.03, 1: 1.03, 2: 1.02 },
  },
  cpi: {
    upPct: 0.01,
    downPct: -0.01,
    flatPct: 0,
  },
  roundToCad: 50,
  highConfidenceMinComps: 8,
  lowConfidenceMaxComps: 4,
};

// ---------------- Pure helpers (unit tested) ----------------

export function roundToNearest(value: number, step: number): number {
  if (!Number.isFinite(value) || step <= 0) return value;
  return Math.round(value / step) * step;
}

export function mileageAdjustmentPct(
  subjectMileageKm: number,
  vehicleAgeYears: number,
  config: MileageDeltaCurve = ADJUSTMENTS.mileage,
): number {
  const expected = Math.max(1, vehicleAgeYears) * config.expectedAnnualKm;
  const deltaKm = expected - subjectMileageKm; // positive = below expected
  const raw = (deltaKm / 10000) * config.perTenKkmPct;
  if (raw > config.maxAdjustPct) return config.maxAdjustPct;
  if (raw < -config.maxAdjustPct) return -config.maxAdjustPct;
  return raw;
}

export function conditionMultiplier(rating: string | null | undefined): number {
  if (!rating) return ADJUSTMENTS.condition.good;
  const key = rating.toLowerCase() as ConditionRating;
  return ADJUSTMENTS.condition[key] ?? ADJUSTMENTS.condition.good;
}

export function accidentMultiplier(signal: string | null | undefined): number {
  if (!signal) return ADJUSTMENTS.accident.unknown;
  const key = signal.toLowerCase() as AccidentSignal;
  return ADJUSTMENTS.accident[key] ?? ADJUSTMENTS.accident.unknown;
}

export function ownersMultiplier(owners: string | number | null | undefined): number {
  if (owners == null) return ADJUSTMENTS.owners.unknown;
  const s = String(owners).toLowerCase();
  if (s === "1") return ADJUSTMENTS.owners["1"];
  if (s === "2") return ADJUSTMENTS.owners["2"];
  const n = Number(s);
  if (Number.isFinite(n) && n >= 3) return ADJUSTMENTS.owners["3+"];
  return ADJUSTMENTS.owners.unknown;
}

export function serviceRecordsMultiplier(records: string | null | undefined): number {
  if (!records) return ADJUSTMENTS.serviceRecords.unknown;
  const key = records.toLowerCase() as ServiceRecords;
  return ADJUSTMENTS.serviceRecords[key] ?? ADJUSTMENTS.serviceRecords.unknown;
}

export function seasonalMultiplier(
  bodyType: string | null | undefined,
  month: number,
): number {
  if (!bodyType) return 1;
  const table = ADJUSTMENTS.seasonal[bodyType.toLowerCase() as BodyType];
  if (!table) return 1;
  return table[month] ?? 1;
}

export function featureBumpDollars(
  features: readonly string[],
  anchor: number,
  config: FeatureDollarValues = ADJUSTMENTS.features,
): number {
  if (!features?.length || !(anchor > 0)) return 0;
  let total = 0;
  const seen = new Set<string>();
  for (const raw of features) {
    const key = String(raw || "").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    total += config.values[key] ?? 0;
  }
  const cap = anchor * config.capPct;
  return Math.min(total, cap);
}

export function cpiNudgePct(
  direction: "up" | "down" | "flat" | "unknown" | null | undefined,
): number {
  switch (direction) {
    case "up":
      return ADJUSTMENTS.cpi.upPct;
    case "down":
      return ADJUSTMENTS.cpi.downPct;
    default:
      return ADJUSTMENTS.cpi.flatPct;
  }
}

/**
 * Median anchor over Stage 1 comps. Excludes major / rebuilt comps and
 * down-weights minor-accident comps per `ADJUSTMENTS.minorAccidentCompWeight`.
 */
export function medianAnchor(
  comps: readonly { askingPriceCad: number | null; accidentSignalFromDescription?: string | null }[],
  cfg: AdjustmentsConfig = ADJUSTMENTS,
): number {
  const weighted: { value: number; weight: number }[] = [];
  for (const c of comps) {
    if (c.askingPriceCad == null || !(c.askingPriceCad > 0)) continue;
    const sig = (c.accidentSignalFromDescription || "unknown").toLowerCase();
    if (sig === "major" || sig === "rebuilt" || sig === "branded") continue;
    const weight = sig === "minor" ? cfg.minorAccidentCompWeight : 1;
    weighted.push({ value: c.askingPriceCad, weight });
  }
  if (!weighted.length) return 0;
  weighted.sort((a, b) => a.value - b.value);
  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  const half = totalWeight / 2;
  let acc = 0;
  for (const w of weighted) {
    acc += w.weight;
    if (acc >= half) return w.value;
  }
  return weighted[weighted.length - 1].value;
}

export function classifyConfidence(
  compsCount: number,
  cfg: AdjustmentsConfig = ADJUSTMENTS,
): "high" | "medium" | "low" {
  if (compsCount >= cfg.highConfidenceMinComps) return "high";
  if (compsCount <= cfg.lowConfidenceMaxComps) return "low";
  return "medium";
}
