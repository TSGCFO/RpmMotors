/**
 * Pure-function unit tests for adjustments.config.ts.
 *
 * Run with:
 *   npx tsx server/appraisal/__tests__/adjustments.test.ts
 * (exits non-zero on any assertion failure).
 */

import { strict as assert } from "node:assert";
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
} from "../adjustments.config";

let passed = 0;
let failed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err: any) {
    failed++;
    console.error(`  FAIL ${name}`);
    console.error(err?.stack || err);
  }
}

console.log("adjustments.config");

test("roundToNearest rounds to nearest $50", () => {
  assert.equal(roundToNearest(12_345, 50), 12_350);
  assert.equal(roundToNearest(12_300, 50), 12_300);
  assert.equal(roundToNearest(12_324, 50), 12_300);
  assert.equal(roundToNearest(12_325, 50), 12_350);
  assert.equal(roundToNearest(0, 50), 0);
});

test("mileageAdjustmentPct positive when below expected, capped", () => {
  // 5-year-old car expected 100,000km. Subject 50,000km => 50k below.
  // 50k / 10k * 0.015 = 0.075 → within cap.
  const p = mileageAdjustmentPct(50_000, 5);
  assert.ok(Math.abs(p - 0.075) < 1e-9, `got ${p}`);
  // Massively below expected → cap.
  assert.equal(mileageAdjustmentPct(0, 10), ADJUSTMENTS.mileage.maxAdjustPct);
  // Massively above expected → negative cap.
  assert.equal(mileageAdjustmentPct(500_000, 1), -ADJUSTMENTS.mileage.maxAdjustPct);
});

test("conditionMultiplier maps unknown to good", () => {
  assert.equal(conditionMultiplier("excellent"), ADJUSTMENTS.condition.excellent);
  assert.equal(conditionMultiplier("EXCELLENT"), ADJUSTMENTS.condition.excellent);
  assert.equal(conditionMultiplier("totally-fake"), ADJUSTMENTS.condition.good);
  assert.equal(conditionMultiplier(null), ADJUSTMENTS.condition.good);
});

test("accidentMultiplier maps signals", () => {
  assert.equal(accidentMultiplier("clean"), ADJUSTMENTS.accident.clean);
  assert.equal(accidentMultiplier("MINOR"), ADJUSTMENTS.accident.minor);
  assert.equal(accidentMultiplier("rebuilt"), ADJUSTMENTS.accident.rebuilt);
  assert.equal(accidentMultiplier(null), ADJUSTMENTS.accident.unknown);
});

test("ownersMultiplier handles strings and numbers", () => {
  assert.equal(ownersMultiplier("1"), ADJUSTMENTS.owners["1"]);
  assert.equal(ownersMultiplier(2), ADJUSTMENTS.owners["2"]);
  assert.equal(ownersMultiplier(3), ADJUSTMENTS.owners["3+"]);
  assert.equal(ownersMultiplier(7), ADJUSTMENTS.owners["3+"]);
  assert.equal(ownersMultiplier(null), ADJUSTMENTS.owners.unknown);
});

test("serviceRecordsMultiplier", () => {
  assert.equal(serviceRecordsMultiplier("full"), ADJUSTMENTS.serviceRecords.full);
  assert.equal(serviceRecordsMultiplier("Partial"), ADJUSTMENTS.serviceRecords.partial);
  assert.equal(serviceRecordsMultiplier("none"), ADJUSTMENTS.serviceRecords.none);
  assert.equal(serviceRecordsMultiplier(null), ADJUSTMENTS.serviceRecords.unknown);
});

test("seasonalMultiplier returns 1 for missing", () => {
  assert.equal(seasonalMultiplier("sedan", 5), 1);
  assert.equal(seasonalMultiplier(null, 5), 1);
  assert.equal(seasonalMultiplier("convertible", 6), 1.06);
});

test("featureBumpDollars caps at 8% of anchor", () => {
  // Many features → sum is above cap.
  const features = [
    "navigation", "sunroof", "panoramic-roof", "heated-seats", "cooled-seats",
    "leather-seats", "premium-audio", "adaptive-cruise", "blind-spot",
    "360-camera", "tow-package", "all-wheel-drive",
  ];
  const anchor = 20_000;
  const bump = featureBumpDollars(features, anchor);
  assert.equal(bump, anchor * ADJUSTMENTS.features.capPct);
  // Single feature → exact value.
  assert.equal(featureBumpDollars(["sunroof"], anchor), ADJUSTMENTS.features.values["sunroof"]);
  // Duplicates are de-duped.
  assert.equal(
    featureBumpDollars(["sunroof", "Sunroof", "SUNROOF"], anchor),
    ADJUSTMENTS.features.values["sunroof"],
  );
  // Unknown feature → 0.
  assert.equal(featureBumpDollars(["nope"], anchor), 0);
});

test("cpiNudgePct returns config values", () => {
  assert.equal(cpiNudgePct("up"), ADJUSTMENTS.cpi.upPct);
  assert.equal(cpiNudgePct("down"), ADJUSTMENTS.cpi.downPct);
  assert.equal(cpiNudgePct("flat"), ADJUSTMENTS.cpi.flatPct);
  assert.equal(cpiNudgePct("unknown"), ADJUSTMENTS.cpi.flatPct);
  assert.equal(cpiNudgePct(null), ADJUSTMENTS.cpi.flatPct);
});

test("medianAnchor excludes major + rebuilt comps", () => {
  const anchor = medianAnchor([
    { askingPriceCad: 10_000, accidentSignalFromDescription: "clean" },
    { askingPriceCad: 20_000, accidentSignalFromDescription: "clean" },
    { askingPriceCad: 30_000, accidentSignalFromDescription: "clean" },
    { askingPriceCad: 5_000, accidentSignalFromDescription: "major" },
    { askingPriceCad: 5_000, accidentSignalFromDescription: "rebuilt" },
  ]);
  // After exclusion → [10k, 20k, 30k]; median = 20k.
  assert.equal(anchor, 20_000);
});

test("medianAnchor down-weights minor-accident comps", () => {
  // 4 clean comps and 1 minor comp pulled down. Without down-weighting the
  // weighted median would shift; with weight 0.5 the minor comp's effective
  // weight is half a normal comp.
  const comps = [
    { askingPriceCad: 18_000, accidentSignalFromDescription: "clean" },
    { askingPriceCad: 19_000, accidentSignalFromDescription: "clean" },
    { askingPriceCad: 21_000, accidentSignalFromDescription: "clean" },
    { askingPriceCad: 22_000, accidentSignalFromDescription: "clean" },
    { askingPriceCad: 12_000, accidentSignalFromDescription: "minor" },
  ];
  const anchor = medianAnchor(comps);
  // Weighted median should be one of the clean comps (>= 19_000).
  assert.ok(anchor >= 19_000, `expected >= 19000 got ${anchor}`);
});

test("classifyConfidence by comp count", () => {
  assert.equal(classifyConfidence(0), "low");
  assert.equal(classifyConfidence(4), "low");
  assert.equal(classifyConfidence(5), "medium");
  assert.equal(classifyConfidence(7), "medium");
  assert.equal(classifyConfidence(8), "high");
  assert.equal(classifyConfidence(20), "high");
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
