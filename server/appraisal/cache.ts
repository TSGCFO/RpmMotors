/**
 * Postgres-backed Stage 1 cache with a 24h TTL.
 *
 * Cache key components:
 *   (year, normalizedMake, normalizedModel, normalizedTrim, mileageBucket)
 * where mileageBucket = floor(mileageKm / 20000).
 *
 * The table is created on demand (idempotent CREATE TABLE IF NOT EXISTS),
 * which keeps the cache self-contained inside the appraisal module.
 */

import { db } from "../db";
import { sql } from "drizzle-orm";
import type { Stage1Output } from "./prompts";
import { Stage1OutputSchema } from "./prompts";

const MILEAGE_BUCKET_KM = 20000;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

let tableReady: Promise<void> | null = null;

async function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "appraisal_stage1_cache" (
          "cache_key" TEXT PRIMARY KEY,
          "payload" JSONB NOT NULL,
          "model_used" TEXT,
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "expires_at" TIMESTAMP NOT NULL
        );
      `);
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS "appraisal_stage1_cache_expires_idx" ON "appraisal_stage1_cache" ("expires_at");`,
      );
    })().catch((err) => {
      // Reset on failure so a later call can retry.
      tableReady = null;
      throw err;
    });
  }
  return tableReady;
}

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().trim().replace(/\s+/g, " ");
}

export interface CacheKeyInput {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  mileageKm: number;
}

export function buildCacheKey(input: CacheKeyInput): string {
  const bucket = Math.floor(Math.max(0, input.mileageKm) / MILEAGE_BUCKET_KM);
  return [
    input.year,
    norm(input.make),
    norm(input.model),
    norm(input.trim) || "any",
    `m${bucket}`,
  ].join("|");
}

export interface CacheGetResult {
  output: Stage1Output;
  modelUsed: string | null;
  ageMs: number;
}

export async function getStage1Cache(
  input: CacheKeyInput,
  now: Date = new Date(),
): Promise<CacheGetResult | null> {
  await ensureTable();
  const key = buildCacheKey(input);
  interface CacheRow extends Record<string, unknown> {
    payload: unknown;
    model_used: string | null;
    created_at: string | Date;
    expires_at: string | Date;
  }
  // drizzle's `db.execute<T>` returns `RowList<T[]>` for postgres-js, which is
  // a plain array of `T` at runtime — so we can iterate it directly.
  const rows = await db.execute<CacheRow>(sql`
    SELECT "payload", "model_used", "created_at", "expires_at"
    FROM "appraisal_stage1_cache"
    WHERE "cache_key" = ${key} AND "expires_at" > ${now}
    LIMIT 1
  `);
  const row = rows[0];
  if (!row) return null;
  try {
    const payload =
      typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    const parsed = Stage1OutputSchema.parse(payload);
    const createdAt =
      row.created_at instanceof Date ? row.created_at : new Date(row.created_at);
    return {
      output: parsed,
      modelUsed: row.model_used ?? null,
      ageMs: Math.max(0, now.getTime() - createdAt.getTime()),
    };
  } catch {
    return null;
  }
}

export async function setStage1Cache(
  input: CacheKeyInput,
  output: Stage1Output,
  modelUsed: string | null,
  ttlMs: number = DEFAULT_TTL_MS,
  now: Date = new Date(),
): Promise<void> {
  await ensureTable();
  const key = buildCacheKey(input);
  const expiresAt = new Date(now.getTime() + ttlMs);
  const payload = JSON.stringify(output);
  await db.execute(sql`
    INSERT INTO "appraisal_stage1_cache" ("cache_key", "payload", "model_used", "created_at", "expires_at")
    VALUES (${key}, ${payload}::jsonb, ${modelUsed}, ${now}, ${expiresAt})
    ON CONFLICT ("cache_key") DO UPDATE SET
      "payload" = EXCLUDED."payload",
      "model_used" = EXCLUDED."model_used",
      "created_at" = EXCLUDED."created_at",
      "expires_at" = EXCLUDED."expires_at"
  `);
}

export async function purgeExpiredStage1Cache(now: Date = new Date()): Promise<void> {
  await ensureTable();
  await db.execute(sql`DELETE FROM "appraisal_stage1_cache" WHERE "expires_at" <= ${now}`);
}
