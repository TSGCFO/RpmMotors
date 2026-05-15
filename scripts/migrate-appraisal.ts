import { db, sql as client } from "../server/db";
import { sql } from "drizzle-orm";

interface NoticeLike {
  severity?: string;
  message?: string;
}

async function run() {
  console.log("Creating appraisal tables / columns...");
  await db.execute(sql`
    DO $$
    BEGIN
      -- inquiries.appraisal_id
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inquiries' AND column_name = 'appraisal_id'
      ) THEN
        ALTER TABLE "inquiries" ADD COLUMN "appraisal_id" INTEGER;
      END IF;
    END $$;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "appraisals" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "postal_code" TEXT,
      "year" INTEGER NOT NULL,
      "make" TEXT NOT NULL,
      "model" TEXT NOT NULL,
      "trim" TEXT,
      "mileage" INTEGER NOT NULL,
      "vin" TEXT,
      "exterior_color" TEXT,
      "transmission" TEXT,
      "drivetrain" TEXT,
      "condition_rating" TEXT,
      "condition_notes" TEXT,
      "modifications" TEXT,
      "accident_history" TEXT,
      "selling_timeline" TEXT,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "error_message" TEXT,
      "result" JSONB,
      "estimated_low" INTEGER,
      "estimated_high" INTEGER,
      "estimated_mid" INTEGER,
      "ip_hash" TEXT,
      "user_agent" TEXT,
      "turnstile_verified" BOOLEAN DEFAULT FALSE,
      "inquiry_id" INTEGER,
      "staff_notified" BOOLEAN DEFAULT FALSE,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appraisals_status_idx" ON "appraisals" ("status");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appraisals_created_at_idx" ON "appraisals" ("created_at");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appraisals_email_idx" ON "appraisals" ("email");`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "appraisal_rate_limits" (
      "id" SERIAL PRIMARY KEY,
      "ip_hash" TEXT,
      "email" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appraisal_rate_limits_ip_idx" ON "appraisal_rate_limits" ("ip_hash", "created_at");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appraisal_rate_limits_email_idx" ON "appraisal_rate_limits" ("email", "created_at");`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "appraisal_audit_log" (
      "id" SERIAL PRIMARY KEY,
      "appraisal_id" INTEGER NOT NULL,
      "event" TEXT NOT NULL,
      "actor" TEXT,
      "details" JSONB,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "appraisal_audit_log_appraisal_idx" ON "appraisal_audit_log" ("appraisal_id", "created_at");`);

  // Task #22 — Per-appraisal cost tracking columns (idempotent ADD COLUMN).
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage1_model') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage1_model" TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage1_input_tokens') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage1_input_tokens" INTEGER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage1_output_tokens') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage1_output_tokens" INTEGER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage1_cache_creation_tokens') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage1_cache_creation_tokens" INTEGER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage1_cache_read_tokens') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage1_cache_read_tokens" INTEGER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage2_model') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage2_model" TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage2_input_tokens') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage2_input_tokens" INTEGER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage2_output_tokens') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage2_output_tokens" INTEGER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage2_cache_creation_tokens') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage2_cache_creation_tokens" INTEGER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='stage2_cache_read_tokens') THEN
        ALTER TABLE "appraisals" ADD COLUMN "stage2_cache_read_tokens" INTEGER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appraisals' AND column_name='total_cost_mills') THEN
        ALTER TABLE "appraisals" ADD COLUMN "total_cost_mills" INTEGER;
      END IF;
    END $$;
  `);

  // FK constraints (idempotent — only add if missing)
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name='inquiries' AND constraint_name='inquiries_appraisal_id_fkey'
      ) THEN
        ALTER TABLE "inquiries"
          ADD CONSTRAINT "inquiries_appraisal_id_fkey"
          FOREIGN KEY ("appraisal_id") REFERENCES "appraisals"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name='appraisals' AND constraint_name='appraisals_inquiry_id_fkey'
      ) THEN
        ALTER TABLE "appraisals"
          ADD CONSTRAINT "appraisals_inquiry_id_fkey"
          FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name='appraisal_audit_log' AND constraint_name='appraisal_audit_log_appraisal_id_fkey'
      ) THEN
        ALTER TABLE "appraisal_audit_log"
          ADD CONSTRAINT "appraisal_audit_log_appraisal_id_fkey"
          FOREIGN KEY ("appraisal_id") REFERENCES "appraisals"("id") ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  // Sanity-check
  interface TableRow { table_name: string }
  interface ColumnRow { column_name: string }
  interface ConstraintRow { constraint_name: string }

  const tables = (await client`
    SELECT table_name FROM information_schema.tables
    WHERE table_name IN ('appraisals','appraisal_rate_limits','appraisal_audit_log');
  `) as unknown as TableRow[];
  console.log("Tables present:", tables.map((t) => t.table_name));

  const col = (await client`
    SELECT column_name FROM information_schema.columns
    WHERE table_name='inquiries' AND column_name='appraisal_id';
  `) as unknown as ColumnRow[];
  console.log("inquiries.appraisal_id present:", col.length > 0);

  const fks = (await client`
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE constraint_name IN (
      'inquiries_appraisal_id_fkey',
      'appraisals_inquiry_id_fkey',
      'appraisal_audit_log_appraisal_id_fkey'
    );
  `) as unknown as ConstraintRow[];
  console.log("FK constraints present:", fks.map((c) => c.constraint_name));

  await client.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
