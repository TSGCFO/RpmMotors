/**
 * Playwright E2E spec for the AI Car Price Calculator (Task #16).
 *
 * Covers all five scenarios end-to-end via real Chromium:
 *   1. Anonymous happy path     — full pipeline → result panel → DB email_sent_at
 *   2. Opt-in lead path         — exactly one inquiry row linked via appraisal_id
 *   3. Staff audit path         — see staff-appraisals.spec.ts
 *   4. Bad input (no DB write)  — server contract + UI inline validation
 *   5. Rate limit / 429         — 11 same-email submissions; first 3 → 200,
 *                                 4-11 → 429, DB row count for that email = 3.
 *                                 Plus UI assertion that the 11th submit shows
 *                                 a friendly error toast and never enters the
 *                                 loading panel.
 *
 * Turnstile bypass: a dev-only magic token `__PLAYWRIGHT_E2E_BYPASS__` is
 * honored by `server/appraisal/turnstile.ts` when NODE_ENV !== "production".
 * The browser-side widget is stubbed via `page.addInitScript` so the form
 * field auto-fills with that token before submit.
 */
import { test, expect, type Page } from "@playwright/test";
import { Client } from "pg";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:5001";
const DATABASE_URL = process.env.DATABASE_URL;
const FORBIDDEN = ["autotrader", "cargurus", "anthropic", "claude", "openai"] as const;
const BYPASS_TOKEN = "__PLAYWRIGHT_E2E_BYPASS__";

async function withDb<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  if (!DATABASE_URL) throw new Error("DATABASE_URL must be set for E2E DB assertions");
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function stubTurnstile(page: Page): Promise<void> {
  await page.addInitScript((token: string) => {
    (window as unknown as { turnstile: unknown }).turnstile = {
      render: (
        _el: HTMLElement,
        opts: { callback?: (t: string) => void },
      ): string => {
        setTimeout(() => opts.callback?.(token), 30);
        return "stub-widget";
      },
      remove: (): void => {},
      reset: (): void => {},
    };
  }, BYPASS_TOKEN);
}

async function assertNoLeakage(page: Page, marker: string): Promise<void> {
  const html = (await page.content()).toLowerCase();
  for (const word of FORBIDDEN) {
    expect(html, `${marker}: DOM contains forbidden source name "${word}"`).not.toContain(word);
  }
}

async function fillFormThroughStep3(
  page: Page,
  contact: { email: string; firstName?: string; lastName?: string; phone?: string; wantsOffer?: boolean },
  vehicle: { year?: string; make?: string; model?: string; mileage?: string } = {},
): Promise<void> {
  await page.goto(`${BASE}/value-my-car`);
  await page.getByTestId("input-year").fill(vehicle.year ?? "2020");
  await page.getByTestId("input-make").fill(vehicle.make ?? "Toyota");
  await page.getByTestId("input-model").fill(vehicle.model ?? "Camry");
  await page.getByTestId("input-mileage").fill(vehicle.mileage ?? "85000");
  await page.getByTestId("select-body-type").click();
  await page.getByRole("option", { name: /sedan/i }).click();
  await page.getByTestId("select-drivetrain").click();
  await page.getByRole("option", { name: /fwd/i }).first().click();
  await page.getByTestId("button-vehicle-next").click();

  await expect(page.getByTestId("form-condition-step")).toBeVisible();
  await page.getByTestId("button-condition-good").click();
  await page.getByTestId("select-accident-history").click();
  await page.getByRole("option", { name: "None", exact: true }).click();
  await page.getByTestId("select-previous-owners").click();
  await page.getByRole("option", { name: "1", exact: true }).click();
  await page.getByTestId("select-service-records").click();
  await page.getByRole("option", { name: "Complete", exact: true }).click();
  await page.getByTestId("button-condition-next").click();

  await expect(page.getByTestId("form-contact-step")).toBeVisible();
  await page.getByTestId("input-first-name").fill(contact.firstName ?? "E2E");
  await page.getByTestId("input-last-name").fill(contact.lastName ?? "Test");
  await page.getByTestId("input-email").fill(contact.email);
  await page.getByTestId("input-phone").fill(contact.phone ?? "4165551212");
  await page.getByTestId("input-postal-code").fill("L4E 3N8");
  if (contact.wantsOffer) {
    await page.getByTestId("checkbox-wants-offer").click();
  }
  // Wait for stub to set token (RHF field populated via Turnstile onToken).
  await page.waitForTimeout(150);
}

test.describe("Appraisal — public surface (no Turnstile required)", () => {
  test("page renders without source-name leakage in DOM", async ({ page }) => {
    await page.goto(`${BASE}/value-my-car`);
    await expect(page.getByTestId("form-vehicle-step")).toBeVisible();
    await expect(page.getByRole("heading", { name: /value my car/i })).toBeVisible();
    await assertNoLeakage(page, "step-1");
  });

  test("Scenario 4 — bad input never reaches POST and never creates a row", async ({
    page,
    request,
  }) => {
    const beforeCount = await withDb(async (c) => {
      const r = await c.query("SELECT count(*)::int AS n FROM appraisals");
      return r.rows[0].n as number;
    });

    const r1 = await request.post(`${BASE}/api/appraisals`, {
      data: { name: "Test", email: "t@t.com", year: 1800, make: "Toyota", model: "Camry", mileage: 85000, turnstileToken: BYPASS_TOKEN },
    });
    expect(r1.status()).toBe(400);

    const r2 = await request.post(`${BASE}/api/appraisals`, {
      data: { name: "Test", email: "notanemail", year: 2020, make: "Toyota", model: "Camry", mileage: 85000, turnstileToken: BYPASS_TOKEN },
    });
    expect(r2.status()).toBe(400);

    const r3 = await request.post(`${BASE}/api/appraisals`, {
      data: { name: "Test", email: "t@t.com", year: 2020, model: "Camry", mileage: 85000, turnstileToken: BYPASS_TOKEN },
    });
    expect(r3.status()).toBe(400);

    // ----- Inline UI assertion 4a: out-of-range year -----
    await page.goto(`${BASE}/value-my-car`);
    await page.getByTestId("input-year").fill("1800");
    await page.getByTestId("input-make").fill("Toyota");
    await page.getByTestId("input-model").fill("Camry");
    await page.getByTestId("input-mileage").fill("85000");
    await page.getByTestId("button-vehicle-next").click();
    await expect(page.getByText(/year must be/i).first()).toBeVisible();
    await expect(page.getByTestId("form-condition-step")).toHaveCount(0);

    // ----- Inline UI assertion 4b: missing required make + model -----
    await page.goto(`${BASE}/value-my-car`);
    await page.getByTestId("input-year").fill("2020");
    // intentionally leave make + model empty
    await page.getByTestId("input-mileage").fill("85000");
    await page.getByTestId("button-vehicle-next").click();
    await expect(page.getByText(/make is required/i).first()).toBeVisible();
    await expect(page.getByText(/model is required/i).first()).toBeVisible();
    await expect(page.getByTestId("form-condition-step")).toHaveCount(0);

    // ----- Inline UI assertion 4c: malformed email at contact step -----
    await page.goto(`${BASE}/value-my-car`);
    await page.getByTestId("input-year").fill("2020");
    await page.getByTestId("input-make").fill("Toyota");
    await page.getByTestId("input-model").fill("Camry");
    await page.getByTestId("input-mileage").fill("85000");
    await page.getByTestId("select-body-type").click();
    await page.getByRole("option", { name: /sedan/i }).click();
    await page.getByTestId("select-drivetrain").click();
    await page.getByRole("option", { name: /fwd/i }).first().click();
    await page.getByTestId("button-vehicle-next").click();
    await expect(page.getByTestId("form-condition-step")).toBeVisible();
    await page.getByTestId("button-condition-good").click();
    await page.getByTestId("select-accident-history").click();
    await page.getByRole("option", { name: "None", exact: true }).click();
    await page.getByTestId("select-previous-owners").click();
    await page.getByRole("option", { name: "1", exact: true }).click();
    await page.getByTestId("select-service-records").click();
    await page.getByRole("option", { name: "Complete", exact: true }).click();
    await page.getByTestId("button-condition-next").click();
    await expect(page.getByTestId("form-contact-step")).toBeVisible();
    await page.getByTestId("input-first-name").fill("Test");
    await page.getByTestId("input-last-name").fill("User");
    // Disable HTML5 native validation so we can drive react-hook-form / Zod
    // directly — this asserts the in-app Zod email rule, which is the real
    // server-aligned validator, not the browser's loose `type="email"` check.
    await page.evaluate(() => {
      document.querySelectorAll("form").forEach((f) => f.setAttribute("novalidate", "true"));
    });
    await page.getByTestId("input-email").fill("notanemail");
    await page.getByTestId("input-phone").fill("4165551212");
    await page.getByTestId("input-postal-code").fill("L4E 3N8");
    await page.getByTestId("button-contact-submit").click();
    await expect(page.getByText(/enter a valid email/i).first()).toBeVisible();
    // Must NOT enter the loading / result panel.
    await expect(page.getByTestId("appraisal-loading")).toHaveCount(0);
    await expect(page.getByTestId("appraisal-result")).toHaveCount(0);

    const afterCount = await withDb(async (c) => {
      const r = await c.query("SELECT count(*)::int AS n FROM appraisals");
      return r.rows[0].n as number;
    });
    expect(afterCount).toBe(beforeCount);
  });

  test("public /status endpoint returns only the closed union", async ({ request }) => {
    const r1 = await request.get(`${BASE}/api/appraisals/0/status`);
    expect(r1.status()).toBe(200);
    const body1 = (await r1.json()) as Record<string, unknown>;
    expect(Object.keys(body1).sort()).toEqual(["status"]);
    expect(body1.status).toBe("pending");

    const r2 = await request.get(`${BASE}/api/appraisals/1/status?token=invalid`);
    expect(r2.status()).toBe(401);
    const body2 = (await r2.json()) as Record<string, unknown>;
    for (const k of Object.keys(body2)) {
      expect(["status", "estimatedPriceCad"]).toContain(k);
    }
    for (const forbidden of ["reasoning", "factor", "factors", "confidence", "comp", "comps"]) {
      expect(Object.keys(body2)).not.toContain(forbidden);
    }
  });

  test("loading panel shows only generic rotating messages — no source-name leakage", async ({
    page,
  }) => {
    // Intercept POST and delay the response so we can read the loading panel
    // before the result panel takes over. This exercises the rotating-message
    // UX without depending on real Claude latency.
    await stubTurnstile(page);
    await page.route(`**/api/appraisals`, async (route) => {
      await new Promise((r) => setTimeout(r, 4000));
      await route.continue();
    });
    const email = `loading+${Date.now()}@e2e.rpmauto.local`;
    await fillFormThroughStep3(page, { email, wantsOffer: false });
    await page.getByTestId("button-contact-submit").click();

    // Loading panel must appear and contain a rotating message — never a
    // source name.
    const loading = page.getByTestId("appraisal-loading");
    await expect(loading).toBeVisible({ timeout: 8_000 });
    const loadingText = (await loading.innerText()).toLowerCase();
    for (const forbidden of FORBIDDEN) {
      expect(loadingText, `loading panel leaks "${forbidden}"`).not.toContain(forbidden);
    }
    // Must be one of the generic curated messages.
    expect(
      /analyzing|cross-referencing|calculating/i.test(loadingText),
      `loading panel text must be a generic rotating message, got: "${loadingText}"`,
    ).toBe(true);
    await assertNoLeakage(page, "loading-panel");
  });
});

test.describe("Appraisal — navigation surfaces", () => {
  test("Scenario nav — header, footer, and home teaser all link to /value-my-car", async ({
    page,
  }) => {
    await page.goto(`${BASE}/`);
    await expect(page.getByTestId("link-value-my-car-desktop")).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByTestId("link-value-my-car-footer")).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.getByTestId("link-value-my-car-home")).toBeVisible();

    await page.getByTestId("link-value-my-car-desktop").click();
    await expect(page).toHaveURL(/\/value-my-car$/);
  });
});

test.describe("Appraisal — full pipeline scenarios (real Claude)", () => {
  test.beforeEach(async ({ page }) => {
    await stubTurnstile(page);
  });

  test.setTimeout(240_000);

  test("Scenario 1 — anonymous happy path produces result + email_sent_at + strict DOM contract", async ({
    page,
  }) => {
    const email = `s1+${Date.now()}@e2e.rpmauto.local`;
    await fillFormThroughStep3(page, { email, wantsOffer: false });

    await page.getByTestId("button-contact-submit").click();
    await expect(
      page.getByTestId("appraisal-loading").or(page.getByTestId("appraisal-result")),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("appraisal-result")).toBeVisible({ timeout: 200_000 });
    await assertNoLeakage(page, "result");

    // ----- Strict DOM contract on the result panel -----
    const resultPanel = page.getByTestId("appraisal-result");
    const resultText = (await resultPanel.innerText()).trim();
    // Deterministic snapshot: the exact set of `data-testid` elements
    // inside the result panel must equal this allow-list. Anything new
    // would surface here, including accidental staff-only fields.
    const testIds = await resultPanel.evaluate((el) =>
      Array.from(el.querySelectorAll("[data-testid]"))
        .map((n) => (n as HTMLElement).getAttribute("data-testid") || "")
        .sort(),
    );
    // `querySelectorAll` does not include the root element itself, so the
    // outer `appraisal-result` testid is intentionally not in this list.
    expect(testIds).toEqual(
      [
        "button-start-new-appraisal",
        "text-email-confirmation",
        "text-estimate-value",
      ].sort(),
    );
    // Must contain exactly: a dollar amount, the confirmation line, and the
    // restart button label. Nothing else of substance.
    expect(resultText).toMatch(/\$\s?[\d,]+/);
    expect(resultText.toLowerCase()).toContain("emailed this estimate");
    await expect(page.getByTestId("text-estimate-value")).toBeVisible();
    await expect(page.getByTestId("button-start-new-appraisal")).toBeVisible();
    // No leakage of internal audit fields.
    for (const forbidden of [
      "reasoning", "rationale", "factor", "confidence",
      "comp", "comparable", "anchor", "internalbreakdown",
      "mileageadj", "ownerspct",
    ]) {
      expect(resultText.toLowerCase()).not.toContain(forbidden);
    }
    // The visible result text is short — just price + confirmation + restart
    // button label. Allow some slack for whitespace but cap word count.
    const wordCount = resultText.split(/\s+/).filter(Boolean).length;
    expect(wordCount, `result panel should be terse, got: "${resultText}"`).toBeLessThanOrEqual(25);

    // ----- DB assertion: row exists, completed, with email_sent_at set -----
    const row = await withDb(async (c) => {
      const r = await c.query(
        `SELECT id, status, estimated_mid, inquiry_id, email_sent_at, email_error
         FROM appraisals WHERE email = $1 ORDER BY id DESC LIMIT 1`,
        [email],
      );
      return r.rows[0] as
        | {
            id: number;
            status: string;
            estimated_mid: number;
            inquiry_id: number | null;
            email_sent_at: string | null;
            email_error: string | null;
          }
        | undefined;
    });
    expect(row).toBeTruthy();
    expect(row!.status).toBe("completed");
    expect(row!.inquiry_id).toBeNull();
    expect(row!.estimated_mid).toBeGreaterThan(0);
    // email_sent_at is the required side-effect for Scenario 1. The orchestrator
    // sets it after a successful SendGrid response; it should be populated
    // within a few seconds of the result render. Allow a short poll.
    let emailSentAt = row!.email_sent_at;
    for (let i = 0; i < 10 && !emailSentAt; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const r2 = await withDb(async (c) =>
        c.query<{ email_sent_at: string | null }>(
          "SELECT email_sent_at FROM appraisals WHERE id = $1",
          [row!.id],
        ),
      );
      emailSentAt = r2.rows[0]?.email_sent_at ?? null;
    }
    expect(
      emailSentAt,
      "Scenario 1: appraisals.email_sent_at must be populated by the orchestrator",
    ).not.toBeNull();
  });

  test("Scenario 2 — opt-in lead path creates exactly one inquiry linked to the appraisal", async ({
    page,
  }) => {
    const email = `s2+${Date.now()}@e2e.rpmauto.local`;
    await fillFormThroughStep3(page, { email, wantsOffer: true });

    await page.getByTestId("button-contact-submit").click();
    await expect(
      page.getByTestId("appraisal-loading").or(page.getByTestId("appraisal-result")),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("appraisal-result")).toBeVisible({ timeout: 200_000 });

    let row: { id: number; inquiry_id: number | null } | undefined;
    for (let i = 0; i < 20; i++) {
      row = await withDb(async (c) => {
        const r = await c.query(
          "SELECT id, inquiry_id FROM appraisals WHERE email = $1 ORDER BY id DESC LIMIT 1",
          [email],
        );
        return r.rows[0] as { id: number; inquiry_id: number | null } | undefined;
      });
      if (row?.inquiry_id) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    expect(row).toBeTruthy();
    expect(row!.inquiry_id).toBeTruthy();

    const inquiries = await withDb(async (c) => {
      const r = await c.query(
        "SELECT id, message, appraisal_id FROM inquiries WHERE id = $1",
        [row!.inquiry_id],
      );
      return r.rows as Array<{
        id: number;
        message: string;
        appraisal_id: number | null;
      }>;
    });
    expect(inquiries).toHaveLength(1);
    expect(inquiries[0].message).toContain(`/employee/appraisals/${row!.id}`);
    // Tighten contract fidelity: the inquiry must point back to the
    // appraisal via the dedicated FK column, not just the message link.
    expect(inquiries[0].appraisal_id).toBe(row!.id);
  });

  test("Scenario 5 — 11 same-email submissions: first 3 succeed, 4-11 all 429, DB cap=3, UI shows friendly error", async ({
    page,
    request,
  }) => {
    const email = `s5+${Date.now()}@e2e.rpmauto.local`;
    const submit = (i: number) =>
      request.post(`${BASE}/api/appraisals`, {
        data: {
          name: "RL Test",
          firstName: "RL",
          lastName: "Test",
          email,
          year: 2020,
          make: "Toyota",
          model: "Camry",
          mileage: 80000 + i * 1000,
          turnstileToken: BYPASS_TOKEN,
        },
      });

    const statuses: number[] = [];
    const messages: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = await submit(i);
      statuses.push(r.status());
      if (r.status() === 429) {
        const body = (await r.json()) as { message?: string };
        expect(typeof body.message).toBe("string");
        messages.push(body.message ?? "");
      }
    }

    expect(statuses.slice(0, 3)).toEqual([200, 200, 200]);
    for (const s of statuses.slice(3)) {
      expect(s).toBe(429);
    }
    // Friendly message must not leak internal terms.
    for (const msg of messages) {
      const lower = msg.toLowerCase();
      for (const forbidden of FORBIDDEN) {
        expect(lower, `429 message leaks "${forbidden}"`).not.toContain(forbidden);
      }
    }

    // DB cap: exactly EMAIL_HOUR_LIMIT (=3) rows for this email.
    const count = await withDb(async (c) => {
      const r = await c.query(
        "SELECT count(*)::int AS n FROM appraisals WHERE email = $1",
        [email],
      );
      return r.rows[0].n as number;
    });
    expect(count).toBe(3);

    // ----- UI assertion: 11th submission via the form shows a friendly toast,
    // does NOT enter the loading panel, and does NOT create a 4th DB row. -----
    await fillFormThroughStep3(page, { email, wantsOffer: false });
    await page.getByTestId("button-contact-submit").click();
    // The server returns 429 → the page surfaces a toast error and stays on
    // the contact step (no loading panel transition).
    await expect(page.getByText(/too many|try again|hour|limit/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("appraisal-loading")).toHaveCount(0);
    await expect(page.getByTestId("appraisal-result")).toHaveCount(0);

    const finalCount = await withDb(async (c) => {
      const r = await c.query(
        "SELECT count(*)::int AS n FROM appraisals WHERE email = $1",
        [email],
      );
      return r.rows[0].n as number;
    });
    expect(finalCount).toBe(3);
  });
});
