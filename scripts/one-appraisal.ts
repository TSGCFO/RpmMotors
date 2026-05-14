import { storage } from "../server/storage";
import { runAppraisalOrchestration } from "../server/appraisal/orchestrator";
import { insertAppraisalSchema, type InsertAppraisal } from "@shared/schema";

const idx = Number(process.argv[2] || "0");
const VEHICLES: Array<{ year: number; make: string; model: string; trim: string; mileage: number }> = [
  { year: 2017, make: "Mazda", model: "CX-5", trim: "GT", mileage: 98000 },
  { year: 2020, make: "Subaru", model: "Outback", trim: "Limited", mileage: 70000 },
  { year: 2015, make: "Toyota", model: "RAV4", trim: "XLE", mileage: 132000 },
  { year: 2021, make: "Volkswagen", model: "Jetta", trim: "SE", mileage: 48000 },
  { year: 2018, make: "Acura", model: "TLX", trim: "Tech", mileage: 85000 },
  { year: 2019, make: "Lexus", model: "RX 350", trim: "Premium", mileage: 78000 },
];
const v = VEHICLES[idx];
// Build the payload through the same Zod schema the production API uses.
// This validates and applies the schema's transforms (trim, null-coercion,
// postal-code normalization, etc.) — producing a fully-typed InsertAppraisal
// without any unsafe casts.
const insert: InsertAppraisal = insertAppraisalSchema.parse({
  name: `Cost Monitor Solo ${idx}`,
  email: `costmon-solo+${idx}.${Date.now()}@rpmautosales.ca`,
  phone: "4165550000",
  postalCode: null,
  year: v.year,
  make: v.make,
  model: v.model,
  trim: v.trim,
  mileage: v.mileage,
  vin: null,
  exteriorColor: null,
  transmission: null,
  drivetrain: null,
  conditionRating: null,
  conditionNotes: null,
  modifications: null,
  accidentHistory: "No accidents",
  sellingTimeline: null,
});

(async () => {
  const row = await storage.createAppraisal(insert);
  console.log(`[solo ${idx}] id=${row.id} ${v.year} ${v.make} ${v.model}`);
  const t0 = Date.now();
  try {
    await runAppraisalOrchestration(row.id, false, { skipSideEffects: true });
    console.log(`[solo ${idx}] DONE id=${row.id} in ${Date.now()-t0}ms`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`[solo ${idx}] FAIL id=${row.id} ${msg}`);
  }
  process.exit(0);
})();
