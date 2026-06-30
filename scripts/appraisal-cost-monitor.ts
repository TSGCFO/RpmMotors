/**
 * Cost-monitoring runner for the appraisal pipeline (Task #16).
 *
 * Bypasses Turnstile + rate-limit by calling the orchestrator directly via
 * storage + runAppraisalOrchestration (not the public POST), so this can
 * run in any env with a real ANTHROPIC_API_KEY.
 *
 * skipSideEffects: true → no customer email, no inquiry row, no staff email.
 *
 * Cost model (CAD, approximate):
 *   - claude-opus-4-5: $15 / Mtok input, $75 / Mtok output (USD ≈ same CAD).
 *   - Web search tool: $10 / 1000 calls (~3 / appraisal).
 *   - Web fetch tool: $0 per call (free) at time of writing.
 *   - Firecrawl scrape (fallback only): $0.001 / scrape.
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

interface OrchestratorMeta {
  stage1DurationMs?: number;
  stage2DurationMs?: number;
  cacheHit?: boolean;
  modelUsed?: string;
}

interface Stage2Result {
  confidence?: string;
}

interface AppraisalResultShape {
  meta?: OrchestratorMeta;
  stage2?: Stage2Result;
}

interface CompletedAuditDetails {
  stage1DurationMs?: number;
  stage2DurationMs?: number;
  cacheHit?: boolean;
  modelUsed?: string;
}

const VEHICLES: SeedVehicle[] = [
  { year: 2020, make: "Toyota", model: "Camry", trim: "XLE", mileage: 85000, accidentHistory: "No accidents" },
  { year: 2019, make: "Honda", model: "Civic", trim: "Touring", mileage: 92000, accidentHistory: "No accidents" },
  { year: 2018, make: "BMW", model: "X5", trim: "xDrive35i", mileage: 110000, accidentHistory: "Minor accident" },
  { year: 2021, make: "Ford", model: "F-150", trim: "XLT", mileage: 65000, accidentHistory: "No accidents" },
  { year: 2017, make: "Mercedes-Benz", model: "C300", trim: "4MATIC", mileage: 130000, accidentHistory: "No accidents" },
  { year: 2022, make: "Tesla", model: "Model 3", trim: "Long Range", mileage: 30000, accidentHistory: "No accidents" },
  { year: 2016, make: "Hyundai", model: "Elantra", trim: "GLS", mileage: 145000, accidentHistory: "No accidents" },
  { year: 2020, make: "Jeep", model: "Wrangler", trim: "Sahara", mileage: 70000, accidentHistory: "No accidents" },
  { year: 2019, make: "Audi", model: "Q5", trim: "Progressiv", mileage: 95000, accidentHistory: "No accidents" },
  { year: 2018, make: "Chevrolet", model: "Silverado 1500", trim: "LT", mileage: 120000, accidentHistory: "No accidents" },
];

interface RunRow {
  id: number;
  v: SeedVehicle;
  status: string;
  stage1Ms: number;
  stage2Ms: number;
  totalMs: number;
  cacheHit: boolean;
  modelUsed: string;
  estimatedMid: number | null;
  confidence: string | null;
  error?: string;
}

async function runOne(i: number, startedAt: number): Promise<RunRow> {
  const v = VEHICLES[i];
  const insert: InsertAppraisal = {
    name: `Cost Monitor ${i + 1}`,
    email: `costmon+${i + 1}.${startedAt}@rpmautosales.ca`,
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
  const inserted = await storage.createAppraisal(insert);
  console.log(`[start ${i + 1}/${VEHICLES.length}] ${v.year} ${v.make} ${v.model} ${v.trim ?? ""} — id ${inserted.id}`);
  let pipelineErr: string | undefined;
  try {
    await runAppraisalOrchestration(inserted.id, false, { skipSideEffects: true });
  } catch (err) {
    pipelineErr = err instanceof Error ? err.message : String(err);
    console.error(`  [${i + 1}] pipeline threw: ${pipelineErr}`);
  }
  const after = await storage.getAppraisal(inserted.id);
  const audit = await storage.getAppraisalAuditLog(inserted.id);
  const completedAudit = audit.find((a) => a.event === "completed");
  const details = (completedAudit?.details ?? {}) as CompletedAuditDetails;
  const result = (after?.result ?? {}) as AppraisalResultShape;
  const meta = result.meta ?? {};
  const stage2 = result.stage2 ?? {};
  const stage1Ms = Number(details.stage1DurationMs ?? meta.stage1DurationMs ?? 0);
  const stage2Ms = Number(details.stage2DurationMs ?? meta.stage2DurationMs ?? 0);
  const totalMs = Date.now() - t0;
  const row: RunRow = {
    id: inserted.id,
    v,
    status: after?.status ?? "?",
    stage1Ms,
    stage2Ms,
    totalMs,
    cacheHit: Boolean(details.cacheHit ?? meta.cacheHit),
    modelUsed: String(details.modelUsed ?? meta.modelUsed ?? ""),
    estimatedMid: after?.estimatedMid ?? null,
    confidence: stage2.confidence ?? null,
    error: after?.errorMessage ?? pipelineErr,
  };
  console.log(
    `[done  ${i + 1}/${VEHICLES.length}] status=${row.status} s1=${stage1Ms}ms s2=${stage2Ms}ms wall=${totalMs}ms mid=$${row.estimatedMid ?? "n/a"}`,
  );
  return row;
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set; cannot run live cost monitor.");
    process.exit(2);
  }
  const fcConfigured = Boolean(process.env.FIRECRAWL_API_KEY);
  console.log(`Firecrawl fallback ${fcConfigured ? "configured" : "NOT configured (no-op fallback)"}.`);

  const startedAt = Date.now();
  const rows = await Promise.all(VEHICLES.map((_, i) => runOne(i, startedAt)));

  const costEstimate = (r: RunRow): number => (r.cacheHit ? 0.035 : 0.115);
  const totals = rows.reduce(
    (acc, r) => {
      acc.s1 += r.stage1Ms;
      acc.s2 += r.stage2Ms;
      acc.tot += r.totalMs;
      acc.cost += costEstimate(r);
      return acc;
    },
    { s1: 0, s2: 0, tot: 0, cost: 0 },
  );
  const median = (xs: number[]): number => {
    const s = [...xs].sort((a, b) => a - b);
    return s.length === 0 ? 0 : s[Math.floor(s.length / 2)];
  };
  const medTotal = median(rows.map((r) => r.totalMs));

  console.log("\n\n## Results\n");
  console.log("| # | Vehicle | stage1Ms | stage2Ms | totalMs | cache | model | mid$ | conf | status | est $ |");
  console.log("|---|---------|---------:|---------:|--------:|:-----:|-------|-----:|------|--------|------:|");
  rows.forEach((r, i) => {
    const veh = `${r.v.year} ${r.v.make} ${r.v.model} ${r.v.trim ?? ""}`.trim();
    console.log(
      `| ${i + 1} | ${veh} | ${r.stage1Ms} | ${r.stage2Ms} | ${r.totalMs} | ${r.cacheHit ? "Y" : "N"} | ${r.modelUsed || "-"} | ${r.estimatedMid ?? "-"} | ${r.confidence ?? "-"} | ${r.status} | ${costEstimate(r).toFixed(3)} |`,
    );
  });
  console.log(
    `\nMedian total wall: ${medTotal} ms  |  Sum stage1: ${totals.s1} ms  |  Sum stage2: ${totals.s2} ms  |  Total wall: ${totals.tot} ms  |  Est total cost: $${totals.cost.toFixed(3)} CAD`,
  );
  console.log(`Firecrawl: ${fcConfigured ? "configured" : "not configured (fallback only kicks in on web_fetch block)"}`);
}

main().then(
  () => process.exit(0),
  (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  },
);
