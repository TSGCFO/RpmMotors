/**
 * Sequential cost-monitoring daemon for the appraisal pipeline (Task #16).
 *
 * Runs additional vehicles one at a time so the parent agent shell's
 * 2-minute tool timeout cannot abort an in-flight orchestration. Started
 * detached by `scripts/run-cost-mon-daemon.cjs`.
 *
 * Bypasses Turnstile + rate-limit by calling the orchestrator directly with
 * skipSideEffects: true (no customer email, no inquiry row).
 */
import { storage } from "../server/storage";
import { runAppraisalOrchestration } from "../server/appraisal/orchestrator";
import type { InsertAppraisal } from "@shared/schema";

interface SeedVehicle {
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  accidentHistory: string;
}

const VEHICLES: SeedVehicle[] = [
  { year: 2019, make: "Honda", model: "Civic", trim: "Touring", mileage: 92000, accidentHistory: "No accidents" },
  { year: 2022, make: "Tesla", model: "Model 3", trim: "Long Range", mileage: 30000, accidentHistory: "No accidents" },
  { year: 2016, make: "Hyundai", model: "Elantra", trim: "GLS", mileage: 145000, accidentHistory: "No accidents" },
  { year: 2018, make: "Chevrolet", model: "Silverado 1500", trim: "LT", mileage: 120000, accidentHistory: "No accidents" },
  { year: 2021, make: "Ford", model: "F-150", trim: "XLT", mileage: 65000, accidentHistory: "No accidents" },
  { year: 2019, make: "Nissan", model: "Rogue", trim: "SV", mileage: 88000, accidentHistory: "No accidents" },
  { year: 2020, make: "Kia", model: "Forte", trim: "EX", mileage: 55000, accidentHistory: "No accidents" },
];

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set; aborting.");
    process.exit(2);
  }
  const startedAt = Date.now();
  for (let i = 0; i < VEHICLES.length; i++) {
    const v = VEHICLES[i];
    const insert: InsertAppraisal = {
      name: `Cost Monitor Seq ${i + 1}`,
      email: `costmon-seq+${i + 1}.${startedAt}@rpmautosales.ca`,
      phone: "4165550000",
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
      mileage: v.mileage,
      accidentHistory: v.accidentHistory,
      conditionRating: "good",
    };
    const t0 = Date.now();
    let id = -1;
    try {
      const row = await storage.createAppraisal(insert);
      id = row.id;
      console.log(`[seq ${i + 1}/${VEHICLES.length}] id=${id} ${v.year} ${v.make} ${v.model}`);
      await runAppraisalOrchestration(id, false, { skipSideEffects: true });
      console.log(`[seq ${i + 1}/${VEHICLES.length}] done id=${id} wall=${Date.now() - t0}ms`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[seq ${i + 1}/${VEHICLES.length}] id=${id} threw: ${message}`);
    }
  }
  console.log(`all-done after ${Date.now() - startedAt}ms`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("fatal:", message);
  process.exit(1);
});
