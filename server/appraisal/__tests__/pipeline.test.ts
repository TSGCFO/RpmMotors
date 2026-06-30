/**
 * Pipeline + Zod schema integration tests with a mocked Claude client.
 *
 * Run with: npx tsx server/appraisal/__tests__/pipeline.test.ts
 */

import { strict as assert } from "node:assert";
import { Stage1OutputSchema, Stage2OutputSchema, type Stage1Output } from "../prompts";
import { computeInternalBreakdown, runStage2 } from "../stage2-appraisal";
import { runStage1, findBlockedFetchUrls } from "../stage1-research";
import type { ClaudeCallResult } from "../claude";
import { runAppraisalPipeline } from "../pipeline";
import { ADJUSTMENTS, roundToNearest } from "../adjustments.config";

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

const cannedStage1: Stage1Output = {
  comps: Array.from({ length: 8 }, (_, i) => ({
    source: i % 2 === 0 ? "autotrader.ca" : "cargurus.ca",
    url: `https://example.com/listing-${i}`,
    title: `2020 Honda Civic EX #${i}`,
    year: 2020,
    make: "Honda",
    model: "Civic",
    trim: "EX",
    mileageKm: 60_000 + i * 2_000,
    askingPriceCad: 18_000 + i * 500,
    location: "Toronto, ON",
    descriptionExcerpt: "Clean CarFax. Adult-driven. No accidents.",
    accidentSignalFromDescription: i === 7 ? "major" : "clean",
    daysOnMarket: 14,
    sellerType: "dealer",
  })),
  compsBandUsed: "strict",
  compsCount: 8,
  statCanCpiLatest: 158.2,
  statCanCpi3MonthDirection: "up",
  researchNotes: "Found 8 strict comps within Ontario.",
};

function mockClaudeForStage2(): any {
  return {
    messages: {
      create: async (req: any) => {
        // Echo a Stage 2 JSON object that mirrors the breakdown shape we expect.
        // The actual numbers are recomputed/overridden by runStage2 anyway.
        const breakdownMatch = req.messages?.[0]?.content?.match
          ? req.messages[0].content.match(/"internalBreakdown":\s*({[\s\S]*?})/)
          : null;
        const fakeBreakdown = breakdownMatch ? JSON.parse(breakdownMatch[1]) : {
          anchorCad: 19_000, mileageAdjustPct: 0, conditionMult: 1,
          accidentMult: 1, ownersMult: 1, serviceRecordsMult: 1,
          seasonalMult: 1, featureBumpCad: 0, cpiNudgePct: 0,
          preRoundCad: 19_000, compsUsedCount: 7,
        };
        const out = {
          estimatedPriceCad: roundToNearest(fakeBreakdown.preRoundCad ?? 19_000, 50),
          confidence: "high" as const,
          reasoning: "Anchor derived from 7 strict comps; lower mileage and clean history support the price.",
          priceFactors: [
            { label: "Below-average mileage", impact: "positive" as const, detail: "Subject is well below the comp average." },
            { label: "Clean accident history", impact: "positive" as const, detail: "No reported damage." },
          ],
          internalBreakdown: fakeBreakdown,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(out) }],
          stop_reason: "end_turn",
          usage: { input_tokens: 10, output_tokens: 10 },
        };
      },
    },
  };
}

function mockClaudeForStage1(stage1: Stage1Output): any {
  return {
    messages: {
      create: async () => ({
        content: [{ type: "text", text: "```json\n" + JSON.stringify(stage1) + "\n```" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    },
  };
}

console.log("pipeline + schemas");

await test("Stage1OutputSchema validates canned data", () => {
  Stage1OutputSchema.parse(cannedStage1);
});

await test("Stage1OutputSchema rejects bad accident signal", () => {
  const bad = JSON.parse(JSON.stringify(cannedStage1));
  bad.comps[0].accidentSignalFromDescription = "totally-broken";
  assert.throws(() => Stage1OutputSchema.parse(bad));
});

await test("computeInternalBreakdown excludes major-accident comps", () => {
  const b = computeInternalBreakdown(
    {
      year: 2020,
      make: "Honda",
      model: "Civic",
      mileageKm: 60_000,
      conditionRating: "good",
      ownerCount: 1,
      serviceRecords: "full",
    },
    cannedStage1,
  );
  assert.equal(b.compsUsedCount, 7, "should drop the one major-accident comp");
  assert.ok(b.anchorCad > 0);
  assert.ok(b.preRoundCad > 0);
});

await test("runStage2 forces $50 rounding and confidence rule", async () => {
  const result = await runStage2(
    {
      year: 2020,
      make: "Honda",
      model: "Civic",
      mileageKm: 60_000,
      conditionRating: "good",
      ownerCount: 1,
      serviceRecords: "full",
      features: ["sunroof", "heated-seats"],
    },
    cannedStage1,
    { client: mockClaudeForStage2() },
  );
  Stage2OutputSchema.parse(result.output);
  assert.equal(
    result.output.estimatedPriceCad % ADJUSTMENTS.roundToCad,
    0,
    "must be a multiple of $50",
  );
  // 7 usable comps → medium per highConfidenceMinComps=8.
  assert.equal(result.output.confidence, "medium");
});

await test("Stage 1 + Stage 2 end-to-end with mocked clients (no cache)", async () => {
  const pipeline = await runAppraisalPipeline(
    {
      year: 2020,
      make: "Honda",
      model: "Civic",
      trim: "EX",
      mileageKm: 60_000,
      bodyType: "sedan",
      conditionRating: "good",
      accidentHistory: "Clean — no claims",
      ownerCount: 1,
      serviceRecords: "full",
      features: ["sunroof"],
    },
    {
      bypassCache: true,
      prebuiltStage1: cannedStage1,
      stage2: { client: mockClaudeForStage2() },
      logger: { info: () => {} },
    },
  );
  assert.ok(pipeline.stage2.estimatedPriceCad > 0);
  assert.equal(pipeline.stage2.estimatedPriceCad % 50, 0);
  Stage1OutputSchema.parse(pipeline.stage1);
  Stage2OutputSchema.parse(pipeline.stage2);
  assert.equal(pipeline.meta.cacheHit, false);
});

await test("runStage1 parses and validates canned Claude output", async () => {
  const r = await runStage1(
    { year: 2020, make: "Honda", model: "Civic", mileageKm: 60_000 },
    { client: mockClaudeForStage1(cannedStage1) },
  );
  assert.equal(r.output.compsCount, 8);
  assert.equal(r.output.comps.length, 8);
});

await test("findBlockedFetchUrls extracts URLs from blocked web_fetch results", () => {
  const raw = {
    text: "",
    model: "test",
    stopReason: null,
    usage: {},
    raw: {
      id: "msg_test",
      type: "message",
      role: "assistant",
      model: "test",
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 0, output_tokens: 0 },
      content: [
        {
          type: "server_tool_use",
          name: "web_fetch",
          input: { url: "https://blocked.example.com/listing-a" },
        },
        {
          type: "web_fetch_tool_result",
          tool_name: "web_fetch",
          is_error: true,
          content: { is_error: true, url: "https://blocked.example.com/listing-a" },
        },
        {
          type: "web_fetch_tool_result",
          tool_name: "web_fetch",
          content: "403 forbidden when fetching https://blocked.example.com/listing-b",
          url: "https://blocked.example.com/listing-b",
        },
        {
          type: "web_fetch_tool_result",
          tool_name: "web_fetch",
          content: { url: "https://ok.example.com/listing-c" },
        },
        { type: "text", text: "ignored" },
      ],
    },
  } as unknown as ClaudeCallResult;
  const urls = findBlockedFetchUrls(raw).sort();
  assert.deepEqual(urls, [
    "https://blocked.example.com/listing-a",
    "https://blocked.example.com/listing-b",
  ]);
});

await test("findBlockedFetchUrls returns [] when content is not an array", () => {
  const raw = {
    text: "",
    model: "test",
    stopReason: null,
    usage: {},
    raw: { content: null },
  } as unknown as ClaudeCallResult;
  assert.deepEqual(findBlockedFetchUrls(raw), []);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
