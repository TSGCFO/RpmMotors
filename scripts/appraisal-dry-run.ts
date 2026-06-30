#!/usr/bin/env tsx
/**
 * Offline dry-run for the appraisal pipeline.
 *
 * Usage:
 *   npx tsx scripts/appraisal-dry-run.ts <input.json>
 *   cat input.json | npx tsx scripts/appraisal-dry-run.ts
 *
 * Input JSON must contain at minimum: { year, make, model, mileageKm }.
 * Optional fields: trim, postalCode, bodyType, conditionRating,
 * accidentHistory, ownerCount, serviceRecords, features (string[]).
 *
 * Flags:
 *   --bypass-cache   skip Stage 1 cache lookup + write
 *
 * Requires ANTHROPIC_API_KEY. Uses FIRECRAWL_API_KEY for fallback if set.
 */

import { readFileSync } from "node:fs";
import { runAppraisalPipeline } from "../server/appraisal/pipeline";
import { buildFirecrawlFallback } from "../server/appraisal/firecrawl";

async function readInput(): Promise<any> {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (args[0]) {
    return JSON.parse(readFileSync(args[0], "utf8"));
  }
  // Read from stdin
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) {
    throw new Error("No input. Pass a JSON file path or pipe JSON via stdin.");
  }
  return JSON.parse(text);
}

async function main() {
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
  const input = await readInput();
  if (!input?.year || !input?.make || !input?.model || input?.mileageKm == null) {
    throw new Error("Input must include year, make, model, and mileageKm.");
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  const firecrawlFetch = buildFirecrawlFallback();

  console.error("--- Appraisal dry-run ---");
  console.error("Input:", JSON.stringify(input, null, 2));
  console.error("Firecrawl fallback:", firecrawlFetch ? "enabled" : "disabled");

  const startedAt = Date.now();
  const result = await runAppraisalPipeline(input, {
    bypassCache: flags.has("--bypass-cache"),
    stage1: { firecrawlFetch },
    logger: { info: (msg, meta) => console.error(`[appraisal] ${msg}`, meta ?? "") },
  });
  const totalMs = Date.now() - startedAt;

  console.log(
    JSON.stringify(
      {
        durationMs: totalMs,
        meta: result.meta,
        stage1: result.stage1,
        stage2: result.stage2,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err?.stack || err);
  process.exit(1);
});
