import { test } from "node:test";
import assert from "node:assert/strict";
import { stageCostMills, totalCostMills, formatMillsAsUsd, priceForModel } from "../cost";

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

test("stageCostMills computes input+output cost in mills (opus)", () => {
  // 1000 input * $15/Mtok = $0.015 = 15 mills
  // 500 output * $75/Mtok = $0.0375 = 37.5 → rounds to 38 mills
  // total = 53 mills
  const mills = stageCostMills({
    model: "claude-opus-4-5",
    inputTokens: 1000,
    outputTokens: 500,
  });
  assert.equal(mills, 53);
});

test("stageCostMills includes cache creation + cache read tokens", () => {
  // 1000 cacheCreate * $18.75/Mtok = $0.01875 → 18.75 → 19 mills (rounded as part of total)
  // 10000 cacheRead * $1.50/Mtok = $0.015 → 15 mills
  // Combined rounding happens at the end: 0.01875 + 0.015 = 0.03375 → 34 mills
  const mills = stageCostMills({
    model: "claude-opus-4-5",
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 1000,
    cacheReadTokens: 10000,
  });
  assert.equal(mills, 34);
});

test("stageCostMills tolerates null/undefined fields", () => {
  assert.equal(stageCostMills({}), 0);
  assert.equal(
    stageCostMills({ model: null, inputTokens: null, outputTokens: null }),
    0,
  );
});

test("totalCostMills sums an array of stages", () => {
  const total = totalCostMills([
    { model: "claude-opus-4-5", inputTokens: 1000, outputTokens: 500 },
    { model: "claude-opus-4-5", inputTokens: 1000, outputTokens: 500 },
  ]);
  assert.equal(total, 106);
});

test("formatMillsAsUsd renders mills as USD with 2 decimals", () => {
  assert.equal(formatMillsAsUsd(0), "$0.00");
  assert.equal(formatMillsAsUsd(1500), "$1.50");
  assert.equal(formatMillsAsUsd(null), "—");
});
