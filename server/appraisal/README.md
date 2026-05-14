# Appraisal Feature — Data Layer

This directory will house the server-side code for the AI-powered Ontario car
price calculator (public `/value-my-car` page). This task (#11) only adds the
**data model, storage interface, and secrets** that everything else depends on.

## New Database Tables

All tables live in `shared/schema.ts`. Migration is performed via
`scripts/migrate-appraisal.ts` (idempotent raw-SQL `CREATE TABLE IF NOT EXISTS`)
because the managed Render Postgres rejects `drizzle-kit push`'s attempts to
modify system views.

### `appraisals`

One row per user-submitted appraisal request. Stores both the input snapshot
and the AI pipeline result.

| Column                | Type             | Notes                                                                              |
| --------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `id`                  | `serial` (PK)    |                                                                                    |
| `name`                | `text NOT NULL`  | Contact name                                                                       |
| `email`               | `text NOT NULL`  | Contact email                                                                      |
| `phone`               | `text`           | Optional                                                                           |
| `postal_code`         | `text`           | Optional Canadian postal code (validated FSA/LDU on input)                         |
| `year`                | `int NOT NULL`   | 1980 .. current_year + 1                                                           |
| `make`                | `text NOT NULL`  |                                                                                    |
| `model`               | `text NOT NULL`  |                                                                                    |
| `trim`                | `text`           |                                                                                    |
| `mileage`             | `int NOT NULL`   | 0 .. 999,999                                                                       |
| `vin`                 | `text`           | Optional 17-char VIN (no I/O/Q)                                                    |
| `exterior_color`      | `text`           |                                                                                    |
| `transmission`        | `text`           |                                                                                    |
| `drivetrain`          | `text`           |                                                                                    |
| `condition_rating`    | `text`           | e.g. excellent / good / fair / poor                                                |
| `condition_notes`     | `text`           | Free text, capped at 500 chars, HTML-stripped                                      |
| `modifications`       | `text`           | Free text, capped at 500 chars, HTML-stripped                                      |
| `accident_history`    | `text`           | Free text, capped at 500 chars, HTML-stripped                                      |
| `selling_timeline`    | `text`           | Optional short text                                                                |
| `status`              | `text NOT NULL`  | `pending` / `stage1_running` / `stage1_complete` / `stage2_running` / `completed` / `failed` |
| `error_message`       | `text`           | Last failure reason                                                                |
| `result`              | `jsonb`          | Full AI pipeline payload (stage 1 + stage 2 + meta)                                |
| `estimated_low`       | `int`            | Denormalized from `result` for sort/filter                                         |
| `estimated_high`      | `int`            | Denormalized from `result`                                                         |
| `estimated_mid`       | `int`            | Denormalized from `result`                                                         |
| `ip_hash`             | `text`           | HMAC-SHA256 of submitter IP using `APPRAISAL_RATE_LIMIT_IP_SALT`                   |
| `user_agent`          | `text`           |                                                                                    |
| `turnstile_verified`  | `boolean`        | Whether Cloudflare Turnstile token verified server-side                            |
| `inquiry_id`          | `int`            | FK-style link to `inquiries.id` after lead routing                                 |
| `staff_notified`      | `boolean`        | Whether SendGrid notification has been dispatched                                  |
| `created_at`          | `timestamp`      |                                                                                    |
| `updated_at`          | `timestamp`      |                                                                                    |

Indexes: `status`, `created_at`, `email`.

### `appraisal_rate_limits`

Append-only ledger for rolling-window rate limiting by hashed IP / email.

| Column       | Type            | Notes                          |
| ------------ | --------------- | ------------------------------ |
| `id`         | `serial` (PK)   |                                |
| `ip_hash`    | `text`          | Salted HMAC of submitter IP    |
| `email`      | `text`          | Lower-cased contact email      |
| `created_at` | `timestamp NOT NULL` | Defaults to `NOW()`       |

Indexes: `(ip_hash, created_at)`, `(email, created_at)` for fast windowed counts.

### `appraisal_audit_log`

Append-only audit trail of significant lifecycle events
(`created`, `ai_stage1_ok`, `ai_stage1_failed`, `ai_stage2_ok`,
`ai_stage2_failed`, `completed`, `email_sent`, `staff_viewed`,
`staff_updated`, …).

| Column          | Type                 | Notes                                       |
| --------------- | -------------------- | ------------------------------------------- |
| `id`            | `serial` (PK)        |                                             |
| `appraisal_id`  | `int NOT NULL`       | References `appraisals.id`                  |
| `event`         | `text NOT NULL`      | Short event code                            |
| `actor`         | `text`               | `system`, `staff:<userId>`, `customer` …    |
| `details`       | `jsonb`              | Arbitrary structured payload                |
| `created_at`    | `timestamp NOT NULL` | Defaults to `NOW()`                         |

### `inquiries.appraisal_id`

A new nullable `appraisal_id INTEGER` column on the existing `inquiries` table.
When an appraisal completes and a lead is routed, the inquiry row is linked back
to its originating appraisal via this column.

## Storage Methods (IStorage)

Implemented on `DatabaseStorage` in `server/storage.ts`:

```ts
createAppraisal(input: InsertAppraisal & {
  ipHash?: string | null;
  userAgent?: string | null;
  turnstileVerified?: boolean;
}): Promise<Appraisal>;

updateAppraisalWithResult(
  id: number,
  update: AppraisalResultUpdate
): Promise<Appraisal | undefined>;

setAppraisalStatus(
  id: number,
  status: AppraisalStatus,
  errorMessage?: string | null
): Promise<Appraisal | undefined>;

getAppraisal(id: number): Promise<Appraisal | undefined>;

listAppraisals(options?: AppraisalListOptions): Promise<Appraisal[]>;

countRecentAppraisalsByIpOrEmail(
  query: AppraisalRateLimitQuery   // { ipHash?, email?, windowMs, now? }
): Promise<{ ipCount: number; emailCount: number }>;

logAppraisalAudit(entry: InsertAppraisalAuditLog): Promise<AppraisalAuditLog>;
```

`AppraisalRateLimitQuery.now` is an optional `Date` "clock fake hook" so tests
can pin the rolling-window boundary without freezing system time.

`createAppraisal` writes both an `appraisals` row **and** a matching
`appraisal_rate_limits` row inside a **single DB transaction**, so the
rate-limit ledger and the appraisal record always succeed or fail together.
Email is normalized to lowercase (trimmed) before insert and at every
rate-limit read so case variants cannot bypass per-email limits.

## Validation (Zod, from `shared/schema.ts`)

`insertAppraisalSchema` enforces:

- `name`, `make`, `model` — required, HTML stripped, trimmed.
- `email` — RFC-style email, max 200 chars.
- `year` — integer, 1980 .. current year + 1.
- `mileage` — integer, 0 .. 999,999.
- `vin` — optional; if present, normalized to upper-case and matched against
  `^[A-HJ-NPR-Z0-9]{17}$` (excludes I, O, Q).
- `postalCode` — optional; normalized (upper-case, no spaces) and matched against
  Canadian FSA/LDU regex.
- `conditionNotes`, `modifications`, `accidentHistory` — optional free text,
  HTML stripped, max 500 chars each.
- All other free text — HTML stripped, length-capped.

## Secrets

| Secret                          | Purpose                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| `ANTHROPIC_API_KEY`             | Claude API for the two-stage valuation pipeline             |
| `TURNSTILE_SECRET_KEY`          | Server-side Cloudflare Turnstile verification               |
| `VITE_TURNSTILE_SITE_KEY`       | Public Turnstile site key (exposed to the client)           |
| `APPRAISAL_RATE_LIMIT_IP_SALT`  | HMAC salt for hashing submitter IPs before storing them     |
| `SENDGRID_API_KEY`              | Pre-existing — reused for staff notifications and customer receipts |

## Migration

```bash
# Idempotent — safe to re-run.
npx tsx scripts/migrate-appraisal.ts
```
