import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAnthropicCostCents, formatCentsAsUsd, priceForModel } from "../cost";
import { maybeApplyPromptCache, type SystemBlock } from "../levers/prompt-cache";
import { shouldAllowFetch, remainingFetchBudget } from "../levers/fetch-cap";
import { stripListingHtml } from "../levers/strip-html";
import { loadCostLeverFlags } from "../cost-levers.config";
import { callClaude } from "../claude";
import { runStage1 } from "../stage1-research";

// Ensure the module loads with a key for env-driven config; we never call
// the real API in these tests.
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "test-key";

/** Build a mock Anthropic messages client that records the request and
 * returns a canned response. */
function makeMockClient(responseText: string, usage: Record<string, number> = {}) {
  const calls: any[] = [];
  return {
    calls,
    client: {
      messages: {
        async create(req: any) {
          calls.push(req);
          return {
            content: [{ type: "text", text: responseText }],
            stop_reason: "end_turn",
            usage: {
              input_tokens: usage.input_tokens ?? 1000,
              output_tokens: usage.output_tokens ?? 200,
              cache_creation_input_tokens: usage.cache_creation_input_tokens ?? null,
              cache_read_input_tokens: usage.cache_read_input_tokens ?? null,
            },
          };
        },
      },
    },
  };
}

/** Restore the cost-lever env vars after each runtime-wiring test. */
function withLeverEnv(overrides: Record<string, string | undefined>, fn: () => Promise<void>) {
  const keys = ["APPRAISAL_LEVER_PROMPT_CACHE", "APPRAISAL_LEVER_MAX_FETCHES", "APPRAISAL_LEVER_STRIP_LISTING_HTML"];
  const saved: Record<string, string | undefined> = {};
  for (const k of keys) saved[k] = process.env[k];
  for (const k of keys) {
    if (overrides[k] === undefined) delete process.env[k];
    else process.env[k] = overrides[k];
  }
  return fn().finally(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });
}

// --- cost helpers -----------------------------------------------------------

test("priceForModel returns opus pricing for known model", () => {
  const p = priceForModel("claude-opus-4-5");
  assert.equal(p.inputPerMTok, 15);
  assert.equal(p.outputPerMTok, 75);
  assert.equal(p.cacheCreatePerMTok, 18.75);
  assert.equal(p.cacheReadPerMTok, 1.5);
});

test("priceForModel falls back to default for unknown model", () => {
  const p = priceForModel("some-future-model");
  assert.equal(p.inputPerMTok, 15);
});

test("computeAnthropicCostCents computes input+output cost in cents (opus)", () => {
  // 100_000 input * $15/Mtok = $1.50 = 150 cents
  // 50_000 output * $75/Mtok = $3.75 = 375 cents
  // total = 525 cents ($5.25)
  const cents = computeAnthropicCostCents({
    model: "claude-opus-4-5",
    inputTokens: 100_000,
    outputTokens: 50_000,
  });
  assert.equal(cents, 525);
});

test("computeAnthropicCostCents includes cache create + cache read tokens", () => {
  // 100_000 cacheCreate * $18.75/Mtok = $1.875 → 188 cents (rounded)
  // 1_000_000 cacheRead * $1.50/Mtok = $1.50 → 150 cents
  // Combined: $1.875 + $1.50 = $3.375 → 338 cents
  const cents = computeAnthropicCostCents({
    model: "claude-opus-4-5",
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 100_000,
    cacheReadTokens: 1_000_000,
  });
  assert.equal(cents, 338);
});

test("computeAnthropicCostCents tolerates null/undefined fields", () => {
  assert.equal(computeAnthropicCostCents({}), 0);
  assert.equal(
    computeAnthropicCostCents({ model: null, inputTokens: null, outputTokens: null }),
    0,
  );
});

test("computeAnthropicCostCents matches a realistic two-stage hand calculation", () => {
  // Stage 1: 80_000 in + 4_000 out → 80_000*15 + 4_000*75 = 1_200_000 + 300_000 = 1_500_000
  //          / 1M = $1.50 → 150 cents
  // Stage 2: 4_000 in + 1_500 out → 4_000*15 + 1_500*75 = 60_000 + 112_500 = 172_500
  //          / 1M = $0.1725 → 17 cents (round half-up; .50 → 18, but we have .25 → 17)
  // Total ≈ $1.67 = 167 cents
  const s1 = computeAnthropicCostCents({
    model: "claude-opus-4-5",
    inputTokens: 80_000,
    outputTokens: 4_000,
  });
  const s2 = computeAnthropicCostCents({
    model: "claude-opus-4-5",
    inputTokens: 4_000,
    outputTokens: 1_500,
  });
  assert.equal(s1, 150);
  assert.equal(s2, 17);
  assert.equal(s1 + s2, 167);
});

test("formatCentsAsUsd renders cents as dollars with 2 decimals", () => {
  assert.equal(formatCentsAsUsd(0), "$0.00");
  assert.equal(formatCentsAsUsd(237), "$2.37");
  assert.equal(formatCentsAsUsd(null), "—");
  assert.equal(formatCentsAsUsd(undefined), "—");
});

// --- lever: prompt-cache ---------------------------------------------------

test("prompt-cache lever is a no-op when disabled", () => {
  const blocks: SystemBlock[] = [
    { type: "text", text: "short" },
    { type: "text", text: "this is the longer system prompt" },
  ];
  const out = maybeApplyPromptCache(blocks, false);
  assert.deepEqual(out, blocks);
  for (const b of out) assert.equal(b.cache_control, undefined);
});

test("prompt-cache lever attaches cache_control to the largest block when enabled", () => {
  const blocks: SystemBlock[] = [
    { type: "text", text: "short" },
    { type: "text", text: "this is the longer system prompt" },
  ];
  const out = maybeApplyPromptCache(blocks, true);
  assert.equal(out[0].cache_control, undefined);
  assert.deepEqual(out[1].cache_control, { type: "ephemeral" });
});

// --- lever: fetch-cap ------------------------------------------------------

test("fetch-cap lever allows everything when cap is undefined", () => {
  assert.equal(shouldAllowFetch(0, undefined), true);
  assert.equal(shouldAllowFetch(100, undefined), true);
  assert.equal(remainingFetchBudget(50, undefined), Infinity);
});

test("fetch-cap lever stops fetches once the cap is reached", () => {
  assert.equal(shouldAllowFetch(0, 3), true);
  assert.equal(shouldAllowFetch(2, 3), true);
  assert.equal(shouldAllowFetch(3, 3), false);
  assert.equal(shouldAllowFetch(4, 3), false);
  assert.equal(remainingFetchBudget(2, 3), 1);
  assert.equal(remainingFetchBudget(5, 3), 0);
});

// --- lever: strip-html -----------------------------------------------------

test("strip-html lever is a no-op when disabled", () => {
  const html = "<html><body><script>x</script><p>Hi</p></body></html>";
  assert.equal(stripListingHtml(html, false), html);
});

test("strip-html lever removes scripts, tags, comments when enabled", () => {
  const html = "<html><body><script>evil()</script><nav>menu</nav><p>Listing body</p><!-- ad --></body></html>";
  const out = stripListingHtml(html, true);
  assert.equal(out.includes("evil"), false);
  assert.equal(out.includes("menu"), false);
  assert.equal(out.includes("<"), false);
  assert.equal(out.includes("Listing body"), true);
});

// --- config loader ---------------------------------------------------------

test("loadCostLeverFlags defaults all levers OFF with empty env", () => {
  const flags = loadCostLeverFlags({});
  assert.equal(flags.promptCacheEnabled, false);
  assert.equal(flags.fetchCap, undefined);
  assert.equal(flags.stripListingHtmlEnabled, false);
});

test("loadCostLeverFlags reads env flags when explicitly set", () => {
  const flags = loadCostLeverFlags({
    APPRAISAL_LEVER_PROMPT_CACHE: "1",
    APPRAISAL_LEVER_MAX_FETCHES: "6",
    APPRAISAL_LEVER_STRIP_LISTING_HTML: "1",
  } as NodeJS.ProcessEnv);
  assert.equal(flags.promptCacheEnabled, true);
  assert.equal(flags.fetchCap, 6);
  assert.equal(flags.stripListingHtmlEnabled, true);
});

// --- runtime wiring: callClaude honors lever env vars ---------------------

test("callClaude sends system as a plain string when prompt-cache lever is OFF", async () => {
  await withLeverEnv({}, async () => {
    const m = makeMockClient(JSON.stringify({ ok: true }));
    await callClaude({
      system: "SYS",
      user: "USR",
      stage: "stage2",
      client: m.client,
    });
    assert.equal(typeof m.calls[0].system, "string");
    assert.equal(m.calls[0].system, "SYS");
  });
});

test("callClaude marks Stage 1 system with ephemeral cache_control when prompt-cache lever is ON", async () => {
  await withLeverEnv({ APPRAISAL_LEVER_PROMPT_CACHE: "1" }, async () => {
    const m = makeMockClient(JSON.stringify({ ok: true }));
    await callClaude({
      system: "SYS",
      user: "USR",
      stage: "stage1",
      client: m.client,
    });
    assert.equal(Array.isArray(m.calls[0].system), true);
    assert.deepEqual(m.calls[0].system[0].cache_control, { type: "ephemeral" });
    assert.equal(m.calls[0].system[0].text, "SYS");
  });
});

test("callClaude leaves Stage 2 system as plain string even when prompt-cache lever is ON (scoped to Stage 1)", async () => {
  await withLeverEnv({ APPRAISAL_LEVER_PROMPT_CACHE: "1" }, async () => {
    const m = makeMockClient(JSON.stringify({ ok: true }));
    await callClaude({
      system: "SYS",
      user: "USR",
      stage: "stage2",
      client: m.client,
    });
    assert.equal(typeof m.calls[0].system, "string");
    assert.equal(m.calls[0].system, "SYS");
  });
});

test("callClaude uses default web_fetch max_uses when fetch-cap lever is unset", async () => {
  await withLeverEnv({}, async () => {
    const m = makeMockClient(JSON.stringify({ ok: true }));
    await callClaude({
      system: "SYS",
      user: "USR",
      stage: "stage1",
      client: m.client,
    });
    const tools = m.calls[0].tools;
    const webFetch = tools.find((t: any) => t.name === "web_fetch");
    assert.equal(webFetch.max_uses, 25);
  });
});

test("callClaude lowers web_fetch max_uses when fetch-cap lever is set", async () => {
  await withLeverEnv({ APPRAISAL_LEVER_MAX_FETCHES: "5" }, async () => {
    const m = makeMockClient(JSON.stringify({ ok: true }));
    await callClaude({
      system: "SYS",
      user: "USR",
      stage: "stage1",
      client: m.client,
    });
    const tools = m.calls[0].tools;
    const webFetch = tools.find((t: any) => t.name === "web_fetch");
    assert.equal(webFetch.max_uses, 5);
  });
});

// --- runtime wiring: Stage 1 multi-call usage aggregation -----------------

const STAGE1_VALID_JSON = JSON.stringify({
  comps: Array.from({ length: 6 }, (_, i) => ({
    source: "autotrader.ca",
    url: `https://example.com/l${i}`,
    title: `2020 Honda Civic EX #${i}`,
    year: 2020,
    make: "Honda",
    model: "Civic",
    trim: "EX",
    mileageKm: 60000 + i * 1000,
    askingPriceCad: 19000 + i * 100,
    location: "Toronto, ON",
    descriptionExcerpt: "Clean.",
    accidentSignalFromDescription: "clean",
    daysOnMarket: 10,
    sellerType: "dealer",
  })),
  compsBandUsed: "strict",
  compsCount: 6,
  statCanCpiLatest: 158,
  statCanCpi3MonthDirection: "up",
  researchNotes: "ok",
});

test("runStage1 aggregates usage across initial + Firecrawl-fallback Claude calls (Task #22)", async () => {
  await withLeverEnv({}, async () => {
    let callIdx = 0;
    const mockClient = {
      messages: {
        async create(_req: any) {
          callIdx += 1;
          if (callIdx === 1) {
            // First call: simulate a blocked web_fetch in the response so
            // runStage1 will invoke the Firecrawl fallback and re-ask.
            return {
              content: [
                {
                  type: "web_fetch_tool_result",
                  tool_name: "web_fetch",
                  is_error: true,
                  input: { url: "https://example.com/blocked" },
                },
                { type: "text", text: STAGE1_VALID_JSON },
              ],
              stop_reason: "end_turn",
              usage: {
                input_tokens: 8000,
                output_tokens: 400,
                cache_creation_input_tokens: null,
                cache_read_input_tokens: null,
              },
            };
          }
          // Second call: clean response, valid JSON.
          return {
            content: [{ type: "text", text: STAGE1_VALID_JSON }],
            stop_reason: "end_turn",
            usage: {
              input_tokens: 3000,
              output_tokens: 150,
              cache_creation_input_tokens: null,
              cache_read_input_tokens: null,
            },
          };
        },
      },
    };
    const result = await runStage1(
      { year: 2020, make: "Honda", model: "Civic", trim: "EX", mileageKm: 60000 },
      {
        firecrawlFetch: async () => "<html><body><p>fallback</p></body></html>",
        client: mockClient as any,
      },
    );
    assert.equal(callIdx, 2, "expected two Claude calls (initial + fallback re-ask)");
    // Aggregated usage MUST sum both calls — not just the last one.
    assert.equal(result.aggregatedUsage.inputTokens, 11000);
    assert.equal(result.aggregatedUsage.outputTokens, 550);
    // And aggregated must NOT equal just the final call's usage.
    assert.notEqual(result.aggregatedUsage.inputTokens, result.raw.usage.inputTokens);
  });
});

test("runStage1 records single-call usage when no fallback is triggered", async () => {
  await withLeverEnv({}, async () => {
    const mockClient = {
      messages: {
        async create() {
          return {
            content: [{ type: "text", text: STAGE1_VALID_JSON }],
            stop_reason: "end_turn",
            usage: {
              input_tokens: 5000,
              output_tokens: 300,
              cache_creation_input_tokens: null,
              cache_read_input_tokens: null,
            },
          };
        },
      },
    };
    const result = await runStage1(
      { year: 2020, make: "Honda", model: "Civic", trim: "EX", mileageKm: 60000 },
      { client: mockClient as any },
    );
    assert.equal(result.aggregatedUsage.inputTokens, 5000);
    assert.equal(result.aggregatedUsage.outputTokens, 300);
  });
});
