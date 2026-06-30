/**
 * Second batch for Task #16 cost monitoring. Adds 6 more vehicles to the
 * existing dataset so we exceed the 10+ sample size required by the task.
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
}

interface OrchestratorMeta {
  stage1DurationMs?: number;
  stage2DurationMs?: number;
}

interface AppraisalResultShape {
  meta?: OrchestratorMeta;
  stage2?: { confidence?: string };
}

interface CompletedAuditDetails {
  stage1DurationMs?: number;
  stage2DurationMs?: number;
}

const VEHICLES: SeedVehicle[] = [
  { year: 2020, make: "Toyota", model: "RAV4", trim: "XLE", mileage: 78000 },
  { year: 2017, make: "Subaru", model: "Outback", trim: "Limited", mileage: 140000 },
  { year: 2019, make: "Nissan", model: "Rogue", trim: "SV", mileage: 88000 },
  { year: 2021, make: "Mazda", model: "CX-5", trim: "GT", mileage: 55000 },
  { year: 2018, make: "Volkswagen", model: "Tiguan", trim: "Highline", mileage: 115000 },
  { year: 2020, make: "Kia", model: "Forte", trim: "EX", mileage: 80000 },
];

async function runOne(i: number, started: number): Promise<void> {
  const v = VEHICLES[i];
  const t0 = Date.now();
  const insert: InsertAppraisal = {
    name: `Cost Monitor B2-${i + 1}`,
    email: `costmon2+${i + 1}.${started}@rpmautosales.ca`,
    phone: "4165550000",
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    mileage: v.mileage,
    accidentHistory: "No accidents",
    conditionRating: "good",
  };
  const ins = await storage.createAppraisal(insert);
  console.log(`[start ${i + 1}/${VEHICLES.length}] ${v.year} ${v.make} ${v.model} ${v.trim ?? ""} id ${ins.id}`);
  try {
    await runAppraisalOrchestration(ins.id, false, { skipSideEffects: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  [${i + 1}] threw ${message}`);
  }
  const after = await storage.getAppraisal(ins.id);
  const audit = await storage.getAppraisalAuditLog(ins.id);
  const det = (audit.find((a) => a.event === "completed")?.details ?? {}) as CompletedAuditDetails;
  const result = (after?.result ?? {}) as AppraisalResultShape;
  const meta = result.meta ?? {};
  const stage2 = result.stage2 ?? {};
  const s1 = Number(det.stage1DurationMs ?? meta.stage1DurationMs ?? 0);
  const s2 = Number(det.stage2DurationMs ?? meta.stage2DurationMs ?? 0);
  const wall = Date.now() - t0;
  console.log(
    `[done  ${i + 1}/${VEHICLES.length}] id=${ins.id} ${v.year} ${v.make} ${v.model} status=${after?.status ?? "?"} s1=${s1}ms s2=${s2}ms wall=${wall}ms mid=$${after?.estimatedMid ?? "n/a"} conf=${stage2.confidence ?? "-"}`,
  );
}

async function main(): Promise<void> {
  const started = Date.now();
  await Promise.all(VEHICLES.map((_, i) => runOne(i, started)));
}

main().then(
  () => process.exit(0),
  (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  },
);
