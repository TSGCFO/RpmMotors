/**
 * Top-level orchestrator for the two-stage appraisal pipeline.
 *
 * Flow: cache lookup → Stage 1 (if miss) → cache write → Stage 2 → return.
 * Logs `stage1DurationMs`, `stage2DurationMs`, `modelUsed`, cache hit/miss.
 */

import { runStage1, type Stage1Input, type Stage1Options } from "./stage1-research";
import { runStage2, type Stage2Input, type Stage2Options } from "./stage2-appraisal";
import type { Stage1Output, Stage2Output } from "./prompts";
import { buildCacheKey, getStage1Cache, setStage1Cache } from "./cache";

export interface AppraisalPipelineInput {
  // Required vehicle identity (also used for the Stage 1 cache key).
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  mileageKm: number;
  // Optional subject details consumed by Stage 2.
  postalCode?: string | null;
  bodyType?: string | null;
  conditionRating?: string | null;
  accidentHistory?: string | null;
  ownerCount?: string | number | null;
  serviceRecords?: string | null;
  features?: readonly string[];
}

export interface AppraisalPipelineOptions {
  /** Skip cache lookup AND write (useful for dry-run / debugging). */
  bypassCache?: boolean;
  /** Inject a pre-built Stage1Output, skipping the Stage 1 call entirely. */
  prebuiltStage1?: Stage1Output;
  /** Stage 1 options (model, Firecrawl fallback, mock client). */
  stage1?: Stage1Options;
  /** Stage 2 options (model, mock client). */
  stage2?: Stage2Options;
  /** Custom logger; defaults to console. */
  logger?: { info: (msg: string, meta?: unknown) => void };
}

export interface AppraisalPipelineResult {
  stage1: Stage1Output;
  stage2: Stage2Output;
  meta: {
    cacheHit: boolean;
    cacheKey: string;
    stage1DurationMs: number;
    stage2DurationMs: number;
    modelUsed: string;
    stage1ModelUsed: string | null;
  };
}

const defaultLogger = {
  info: (msg: string, meta?: unknown) => {
    if (meta !== undefined) console.log(`[appraisal] ${msg}`, meta);
    else console.log(`[appraisal] ${msg}`);
  },
};

export async function runAppraisalPipeline(
  input: AppraisalPipelineInput,
  options: AppraisalPipelineOptions = {},
): Promise<AppraisalPipelineResult> {
  const logger = options.logger ?? defaultLogger;
  const cacheKey = buildCacheKey(input);

  const stage1Subject: Stage1Input = {
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim ?? null,
    mileageKm: input.mileageKm,
    postalCode: input.postalCode ?? null,
  };

  let stage1Output: Stage1Output;
  let stage1DurationMs = 0;
  let stage1ModelUsed: string | null = null;
  let cacheHit = false;

  if (options.prebuiltStage1) {
    stage1Output = options.prebuiltStage1;
    logger.info("stage1 skipped (prebuilt)", { cacheKey });
  } else {
    const cached = options.bypassCache ? null : await getStage1Cache(input).catch(() => null);
    if (cached) {
      cacheHit = true;
      stage1Output = cached.output;
      stage1ModelUsed = cached.modelUsed;
      logger.info("stage1 cache hit", { cacheKey, ageMs: cached.ageMs });
    } else {
      const t0 = Date.now();
      const result = await runStage1(stage1Subject, options.stage1 ?? {});
      stage1DurationMs = Date.now() - t0;
      stage1Output = result.output;
      stage1ModelUsed = result.modelUsed;
      logger.info("stage1 complete", {
        cacheKey,
        durationMs: stage1DurationMs,
        modelUsed: stage1ModelUsed,
        compsCount: stage1Output.compsCount,
        compsBandUsed: stage1Output.compsBandUsed,
      });
      if (!options.bypassCache) {
        await setStage1Cache(input, stage1Output, stage1ModelUsed).catch((err) => {
          logger.info("stage1 cache write failed", { error: String(err) });
        });
      }
    }
  }

  const stage2Subject: Stage2Input = {
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim ?? null,
    mileageKm: input.mileageKm,
    bodyType: input.bodyType ?? null,
    conditionRating: input.conditionRating ?? null,
    accidentHistory: input.accidentHistory ?? null,
    ownerCount: input.ownerCount ?? null,
    serviceRecords: input.serviceRecords ?? null,
    features: input.features ?? [],
  };
  const t1 = Date.now();
  const stage2 = await runStage2(stage2Subject, stage1Output, options.stage2 ?? {});
  const stage2DurationMs = Date.now() - t1;
  logger.info("stage2 complete", {
    durationMs: stage2DurationMs,
    modelUsed: stage2.modelUsed,
    estimatedPriceCad: stage2.output.estimatedPriceCad,
    confidence: stage2.output.confidence,
  });

  return {
    stage1: stage1Output,
    stage2: stage2.output,
    meta: {
      cacheHit,
      cacheKey,
      stage1DurationMs,
      stage2DurationMs,
      modelUsed: stage2.modelUsed,
      stage1ModelUsed,
    },
  };
}
