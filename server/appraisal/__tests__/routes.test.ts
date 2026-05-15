/**
 * Integration tests for the public appraisal API.
 *
 * Run with: npx tsx server/appraisal/__tests__/routes.test.ts
 *
 * Uses an in-process Express app and stubs storage + orchestrator + Turnstile
 * so no DB / network / AI calls are made. Verifies route behavior, response
 * shape (public vs staff DTO boundary), rate-limit short-circuit, honeypot,
 * pipeline error path, customer email idempotency, and lead routing.
 */

import { strict as assert } from "node:assert";
import express from "express";
import type { AddressInfo } from "node:net";
import { registerAppraisalRoutes, type PublicStatusResponse } from "../../routes/appraisals";
import { signAppraisalStatusToken, verifyAppraisalStatusToken } from "../status-token";
import { renderCustomerAppraisalEmail } from "../customer-email";
import { runAppraisalOrchestration } from "../orchestrator";
import { storage } from "../../storage";
import type { Appraisal } from "@shared/schema";

let passed = 0;
let failed = 0;
async function test(name: string, fn: () => unknown | Promise<unknown>) {
  try {
    await fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err: any) {
    failed++;
    console.error(`  FAIL ${name}`);
    console.error(err?.stack || err);
  }
}

// ---------- Stub storage ----------
type Row = Appraisal;
const rows = new Map<number, Row>();
const audits: any[] = [];
const inquiries: any[] = [];
let nextId = 1;
let rateLimitDecision: { ipCount: number; emailCount: number } = { ipCount: 0, emailCount: 0 };

const realStorage: any = storage;
const originalMethods = {
  createAppraisal: realStorage.createAppraisal.bind(realStorage),
  updateAppraisalWithResult: realStorage.updateAppraisalWithResult.bind(realStorage),
  setAppraisalStatus: realStorage.setAppraisalStatus.bind(realStorage),
  getAppraisal: realStorage.getAppraisal.bind(realStorage),
  countRecentAppraisalsByIpOrEmail: realStorage.countRecentAppraisalsByIpOrEmail.bind(realStorage),
  logAppraisalAudit: realStorage.logAppraisalAudit.bind(realStorage),
  createInquiry: realStorage.createInquiry.bind(realStorage),
};

realStorage.createAppraisal = async (input: any) => {
  const id = nextId++;
  const row: Row = {
    id,
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone ?? null,
    postalCode: input.postalCode ?? null,
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim ?? null,
    mileage: input.mileage,
    vin: input.vin ?? null,
    exteriorColor: input.exteriorColor ?? null,
    transmission: input.transmission ?? null,
    drivetrain: input.drivetrain ?? null,
    conditionRating: input.conditionRating ?? null,
    conditionNotes: input.conditionNotes ?? null,
    modifications: input.modifications ?? null,
    accidentHistory: input.accidentHistory ?? null,
    sellingTimeline: input.sellingTimeline ?? null,
    status: "pending",
    errorMessage: null,
    result: null,
    estimatedLow: null,
    estimatedHigh: null,
    estimatedMid: null,
    ipHash: input.ipHash ?? null,
    userAgent: input.userAgent ?? null,
    turnstileVerified: !!input.turnstileVerified,
    inquiryId: null,
    staffNotified: false,
    leadInquiryError: null,
    emailSentAt: null,
    emailError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Row;
  rows.set(id, row);
  return row;
};
realStorage.updateAppraisalWithResult = async (id: number, update: any) => {
  const row = rows.get(id);
  if (!row) return undefined;
  Object.assign(row, update);
  row.updatedAt = new Date();
  return row;
};
realStorage.setAppraisalStatus = async (id: number, status: string, msg?: string | null) => {
  const row = rows.get(id);
  if (!row) return undefined;
  (row as any).status = status;
  row.errorMessage = msg ?? null;
  return row;
};
realStorage.getAppraisal = async (id: number) => rows.get(id);
realStorage.countRecentAppraisalsByIpOrEmail = async () => rateLimitDecision;
realStorage.logAppraisalAudit = async (entry: any) => {
  const a = { id: audits.length + 1, ...entry, createdAt: new Date() };
  audits.push(a);
  return a;
};
realStorage.createInquiry = async (input: any) => {
  const i = { id: inquiries.length + 1, ...input, status: "new", createdAt: new Date() };
  inquiries.push(i);
  return i;
};

function resetState() {
  rows.clear();
  audits.length = 0;
  inquiries.length = 0;
  nextId = 1;
  rateLimitDecision = { ipCount: 0, emailCount: 0 };
}

// ---------- Spin up app ----------
const dispatchSpy: { calls: { id: number; wantsOffer: boolean }[] } = { calls: [] };
const app = express();
app.use(express.json());
registerAppraisalRoutes(app, {
  dispatchOrchestration: (id, wantsOffer) => {
    dispatchSpy.calls.push({ id, wantsOffer });
  },
  verifyTurnstile: async () => ({ success: true }),
});

const server = app.listen(0);
const port = (server.address() as AddressInfo).port;
const base = `http://127.0.0.1:${port}`;

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "647-555-0123",
  postalCode: "L4E 3N8",
  year: 2020,
  make: "Toyota",
  model: "Camry",
  trim: "XLE",
  mileage: 80000,
  vin: null,
  exteriorColor: null,
  transmission: null,
  drivetrain: "FWD",
  conditionRating: "Good",
  accidentHistory: "None",
  turnstileToken: "tok-ok",
  wantsOffer: false,
};

async function postJson(path: string, body: unknown, extra?: Record<string, string>) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(extra ?? {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data as any };
}

async function getJson(path: string) {
  const res = await fetch(`${base}${path}`);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data as any };
}

// ---------- Tests ----------

await test("status-token: round-trip sign/verify works and rejects tampered/expired", () => {
  const tok = signAppraisalStatusToken(42);
  assert.ok(verifyAppraisalStatusToken(tok, 42).ok);
  assert.equal(verifyAppraisalStatusToken(tok, 43).ok, false);
  assert.equal(verifyAppraisalStatusToken(tok + "x", 42).ok, false);
  const expired = signAppraisalStatusToken(7, { ttlMs: -1000 });
  const v = verifyAppraisalStatusToken(expired, 7);
  assert.equal(v.ok, false);
  assert.equal(v.reason, "expired");
});

await test("renderer accepts only firstName + estimatedPriceCad and includes both", () => {
  const r = renderCustomerAppraisalEmail({ firstName: "Jane", estimatedPriceCad: 18500 });
  assert.ok(r.text.includes("Jane"));
  assert.ok(r.text.includes("$18,500"));
  assert.ok(r.html.includes("Jane"));
  assert.ok(r.html.includes("$18,500"));
});

await test("POST /api/appraisals: happy path inserts row + dispatches orchestrator", async () => {
  resetState();
  const r = await postJson("/api/appraisals", validBody);
  assert.equal(r.status, 200);
  assert.equal(typeof r.body.appraisalId, "string");
  assert.equal(typeof r.body.statusToken, "string");
  assert.equal(rows.size, 1);
  const row = rows.get(1)!;
  assert.equal(row.email, "jane@example.com");
  assert.equal(row.status, "pending");
  assert.equal(dispatchSpy.calls.length, 1);
  assert.equal(dispatchSpy.calls[0].wantsOffer, false);
});

await test("GET /api/appraisals/:id/status: pending → complete → response shape is exactly {status,estimatedPriceCad}", async () => {
  resetState();
  await postJson("/api/appraisals", validBody);
  const submit = await postJson("/api/appraisals", { ...validBody, email: "two@example.com" });
  const id = Number(submit.body.appraisalId);
  const token = submit.body.statusToken;

  let r = await getJson(`/api/appraisals/${id}/status?token=${encodeURIComponent(token)}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "pending");

  const row = rows.get(id)!;
  (row as any).status = "completed";
  row.estimatedMid = 21500;

  r = await getJson(`/api/appraisals/${id}/status?token=${encodeURIComponent(token)}`);
  assert.equal(r.status, 200);
  const keys = Object.keys(r.body).sort();
  assert.deepEqual(keys, ["estimatedPriceCad", "status"]);
  assert.equal(r.body.status, "complete");
  assert.equal(r.body.estimatedPriceCad, 21500);
  // Public DTO leakage guard — should not include any internal fields.
  for (const leak of [
    "reasoning", "priceFactors", "internalBreakdown", "result", "stage1", "stage2", "comps",
    "estimatedLow", "estimatedHigh", "email", "ipHash", "userAgent",
    // Cost-tracking fields (Task #22) — must never leak to public status.
    "totalCostCents", "stage1CostCents", "stage2CostCents",
    "stage1InputTokens", "stage1OutputTokens", "stage2InputTokens",
    "stage2OutputTokens", "stage1Model", "stage2Model",
  ]) {
    assert.equal(r.body[leak], undefined, `public response leaked field: ${leak}`);
  }
});

await test("GET status: bad token returns 401 with {status:'error'} only", async () => {
  resetState();
  await postJson("/api/appraisals", validBody);
  const r = await getJson(`/api/appraisals/1/status?token=garbage`);
  assert.equal(r.status, 401);
  assert.deepEqual(Object.keys(r.body), ["status"]);
  assert.equal(r.body.status, "error");
});

await test("GET status: failed pipeline returns {status:'error'} (no message leakage)", async () => {
  resetState();
  const submit = await postJson("/api/appraisals", validBody);
  const id = Number(submit.body.appraisalId);
  const row = rows.get(id)!;
  (row as any).status = "failed";
  row.errorMessage = "internal AI failure secret";
  const r = await getJson(`/api/appraisals/${id}/status?token=${encodeURIComponent(submit.body.statusToken)}`);
  assert.equal(r.body.status, "error");
  assert.equal(r.body.errorMessage, undefined);
  assert.equal(r.body.message, undefined);
});

await test("wantsOffer=true → dispatched with wantsOffer flag set", async () => {
  resetState();
  const r = await postJson("/api/appraisals", { ...validBody, wantsOffer: true, email: "lead@example.com" });
  assert.equal(r.status, 200);
  assert.equal(dispatchSpy.calls.at(-1)?.wantsOffer, true);
});

await test("rate limit exceeded → 429 with friendly generic message", async () => {
  resetState();
  rateLimitDecision = { ipCount: 999, emailCount: 0 };
  const r = await postJson("/api/appraisals", validBody);
  assert.equal(r.status, 429);
  assert.ok(typeof r.body.message === "string");
  assert.ok(!/\d/.test(r.body.message), "should not leak counts");
  // No row written.
  assert.equal(rows.size, 0);
  rateLimitDecision = { ipCount: 0, emailCount: 0 };
});

await test("honeypot tripped → returns success-shaped response but writes no DB row and no dispatch", async () => {
  resetState();
  const before = dispatchSpy.calls.length;
  const r = await postJson("/api/appraisals", { ...validBody, website: "https://bot.example" });
  assert.equal(r.status, 200);
  assert.equal(typeof r.body.appraisalId, "string");
  assert.equal(typeof r.body.statusToken, "string");
  assert.equal(rows.size, 0);
  assert.equal(dispatchSpy.calls.length, before);
});

await test("orchestrator happy path: pipeline success → email sent, no inquiry (wantsOffer=false), idempotent on retry", async () => {
  resetState();
  await postJson("/api/appraisals", validBody);
  const id = 1;

  const emailSends: any[] = [];
  const fakeSend = async (p: any) => { emailSends.push(p); return true; };

  await runAppraisalOrchestration(id, false, {
    pipelineOptions: {
      prebuiltStage1: {
        comps: [], compsBandUsed: "strict", compsCount: 0,
        statCanCpiLatest: null, statCanCpi3MonthDirection: "unknown", researchNotes: "test",
      },
      stage2: {
        client: {
          messages: {
            create: async () => ({
              id: "msg_test",
              type: "message",
              role: "assistant",
              model: "test",
              stop_reason: "end_turn",
              stop_sequence: null,
              usage: { input_tokens: 100, output_tokens: 100 },
              content: [{
                type: "text",
                text: JSON.stringify({
                  estimatedPriceCad: 19500,
                  confidence: "medium",
                  reasoning: "test",
                  priceFactors: [],
                  internalBreakdown: {
                    anchorCad: 19500, mileageAdjustPct: 0, conditionMult: 1, accidentMult: 1,
                    ownersMult: 1, serviceRecordsMult: 1, seasonalMult: 1, featureBumpCad: 0,
                    cpiNudgePct: 0, preRoundCad: 19500, compsUsedCount: 0,
                  },
                }),
              }],
            }),
          },
        } as any,
      },
    },
    emailSender: fakeSend,
  });

  const row = rows.get(id)!;
  assert.equal(row.status, "completed");
  assert.ok(typeof row.estimatedMid === "number");
  assert.equal(emailSends.length, 1);
  assert.equal(emailSends[0].to, "jane@example.com");
  assert.equal(emailSends[0].estimatedPriceCad, row.estimatedMid);
  assert.ok(row.emailSentAt instanceof Date);
  assert.equal(row.inquiryId, null);

  // Retry — should not re-send email.
  await runAppraisalOrchestration(id, false, {
    emailSender: fakeSend,
  });
  assert.equal(emailSends.length, 1, "email must not re-send on retry");
});

await test("orchestrator: wantsOffer=true creates inquiry with appraisalId, idempotent", async () => {
  resetState();
  await postJson("/api/appraisals", { ...validBody, wantsOffer: true, email: "lead2@example.com" });
  const id = 1;

  const leadCalls: any[] = [];
  const fakeRouter = async (a: any, p: number) => {
    leadCalls.push({ a, p });
    const inq = { id: 99 + leadCalls.length };
    return { inquiryId: inq.id };
  };

  // Mark as completed manually to skip pipeline.
  const row = rows.get(id)!;
  (row as any).status = "completed";
  row.estimatedMid = 22000;

  await runAppraisalOrchestration(id, true, {
    emailSender: async () => true,
    leadRouter: fakeRouter as any,
  });
  assert.equal(leadCalls.length, 1);
  assert.equal(rows.get(id)!.inquiryId, 100);
  assert.equal(rows.get(id)!.staffNotified, true);

  // Retry — should not double-create inquiry.
  await runAppraisalOrchestration(id, true, {
    emailSender: async () => true,
    leadRouter: fakeRouter as any,
  });
  assert.equal(leadCalls.length, 1, "lead must not be re-created on retry");
});

await test("orchestrator: pipeline error → status='failed', no customer email sent", async () => {
  resetState();
  await postJson("/api/appraisals", { ...validBody, email: "err@example.com" });
  const id = 1;

  const emailSends: any[] = [];
  await runAppraisalOrchestration(id, false, {
    pipelineOptions: {
      stage1: {
        client: {
          messages: { create: async () => { throw new Error("stage1 boom"); } },
        } as any,
      },
    },
    emailSender: async (p) => { emailSends.push(p); return true; },
  });

  const row = rows.get(id)!;
  assert.equal(row.status, "failed");
  assert.ok(row.errorMessage && row.errorMessage.includes("stage1 boom"));
  assert.equal(emailSends.length, 0, "no email on pipeline failure");

  // Status endpoint should report 'error' generically.
  const submit = signAppraisalStatusToken(id);
  const r = await getJson(`/api/appraisals/${id}/status?token=${encodeURIComponent(submit)}`);
  assert.equal(r.body.status, "error");
});

// ---------- Cleanup ----------
server.close();
// Restore real storage methods so other tests aren't affected.
Object.assign(realStorage, originalMethods);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
