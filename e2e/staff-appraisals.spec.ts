/**
 * Scenario 3 — Staff audit path.
 *
 * Logs in as the seeded admin (`admin` / `rpmauto2025`) and verifies that
 * the staff appraisal detail page renders the FULL internal audit surface
 * for a completed real-Claude appraisal — surfaces that must NEVER appear
 * on the public `/value-my-car` flow.
 *
 * Required audit surfaces (all must be present):
 *   - reasoning paragraph (data-testid="text-reasoning")
 *   - factor / priceFactors tag list (data-testid="factor-tags" with ≥1 chip)
 *   - internal breakdown table (data-testid="card-breakdown")
 *   - comps table (data-testid="card-comps") with ≥1 row including:
 *       a source badge, an asking price cell, the accident-signal column,
 *       a description excerpt, and a "View listing" URL when present.
 */
import { test, expect } from "@playwright/test";
import { Client } from "pg";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:5001";
const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Seed a deterministic completed-appraisal fixture in the DB. The shape
 * exactly mirrors a real Claude `claude-opus-4-5` run — reasoning,
 * priceFactors, internalBreakdown, and stage1.comps with the required
 * URL + accidentSignal fields — so the staff detail view renders the
 * full audit surface without depending on ambient DB state or Anthropic
 * credit availability.
 */
async function seedStaffFixture(): Promise<number> {
  if (!DATABASE_URL) throw new Error("DATABASE_URL required");
  const c = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try {
    const result = {
      meta: { modelUsed: "claude-opus-4-5", stage1DurationMs: 12_345, stage2DurationMs: 6_789 },
      stage1: {
        compsCount: 3,
        compsBandUsed: "strict",
        statCanCpiLatest: 162.4,
        statCanCpi3MonthDirection: "up",
        researchNotes: "Three clean Ontario listings within ±10% mileage band.",
        comps: [
          {
            source: "AutoTrader",
            url: "https://www.example-listing.test/a/1",
            title: "2020 Toyota Camry SE",
            year: 2020,
            make: "Toyota",
            model: "Camry",
            trim: "SE",
            mileageKm: 82_000,
            askingPriceCad: 22_995,
            location: "Toronto, ON",
            descriptionExcerpt: "Clean title, one owner, full service history.",
            accidentSignalFromDescription: "clean",
            daysOnMarket: 14,
            sellerType: "dealer",
          },
          {
            source: "AutoTrader",
            url: "https://www.example-listing.test/a/2",
            title: "2020 Toyota Camry LE",
            year: 2020,
            make: "Toyota",
            model: "Camry",
            trim: "LE",
            mileageKm: 88_500,
            askingPriceCad: 21_500,
            location: "Mississauga, ON",
            descriptionExcerpt: "Two owners, dealer-serviced.",
            accidentSignalFromDescription: "minor",
            daysOnMarket: 22,
            sellerType: "dealer",
          },
          {
            source: "Kijiji",
            url: "https://www.example-listing.test/k/3",
            title: "2020 Toyota Camry XLE",
            year: 2020,
            make: "Toyota",
            model: "Camry",
            trim: "XLE",
            mileageKm: 79_000,
            askingPriceCad: 23_900,
            location: "Hamilton, ON",
            descriptionExcerpt: "Loaded XLE trim with leather and sunroof.",
            accidentSignalFromDescription: "clean",
            daysOnMarket: 9,
            sellerType: "private",
          },
        ],
      },
      stage2: {
        reasoning:
          "Three comparable 2020 Camry sedans in the ±10% mileage band cluster around $22,800. The subject is at 85,000 km with clean history; a modest downward mileage adjustment and a small Ontario seasonal nudge yield $22,500.",
        priceFactors: ["clean accident history", "one previous owner", "full service records", "Ontario market"],
        internalBreakdown: {
          anchor: 22_800,
          mileageAdj: -200,
          conditionPct: 1.0,
          accidentPct: 1.0,
          ownersPct: 1.02,
          serviceRecordsPct: 1.01,
          seasonalPct: 1.0,
          featuresDollars: 0,
          cpiPct: 1.0,
          final: 22_500,
          finalLow: 21_500,
          finalHigh: 23_500,
          finalMid: 22_500,
        },
      },
    };
    const insert = await c.query(
      `INSERT INTO appraisals
         (name, email, year, make, model, trim, mileage, accident_history,
          status, estimated_low, estimated_high, estimated_mid, result)
       VALUES
         ($1, $2, 2020, 'Toyota', 'Camry', 'SE', 85000, 'No accidents',
          'completed', 21500, 23500, 22500, $3::jsonb)
       RETURNING id`,
      [
        `Staff Fixture ${Date.now()}`,
        `staff-fixture+${Date.now()}@e2e.rpmauto.local`,
        JSON.stringify(result),
      ],
    );
    return insert.rows[0].id as number;
  } finally {
    await c.end();
  }
}

test.describe("Appraisal — staff audit (Scenario 3)", () => {
  test("staff can view full audit surface for a completed appraisal", async ({
    page,
    request,
  }) => {
    const appraisalId = await seedStaffFixture();

    const login = await request.post(`${BASE}/api/auth/login`, {
      data: { username: "admin", password: "rpmauto2025" },
    });
    expect(login.status()).toBe(200);
    const cookies = await request.storageState();
    await page.context().addCookies(cookies.cookies);

    const me = await request.get(`${BASE}/api/auth/me`);
    expect(me.status()).toBe(200);
    const meBody = (await me.json()) as { authenticated: boolean; role: string };
    expect(meBody.authenticated).toBe(true);
    expect(meBody.role === "admin" || meBody.role === "staff").toBe(true);

    await page.goto(`${BASE}/employee/appraisals/${appraisalId}`);

    // ----- Estimate header -----
    await expect(page.getByTestId("text-estimate")).toBeVisible({ timeout: 15_000 });
    const estimateText = await page.getByTestId("text-estimate").innerText();
    expect(estimateText).toMatch(/\$\s?[\d,]+/);

    // ----- Reasoning paragraph -----
    const reasoning = page.getByTestId("text-reasoning");
    await expect(reasoning, "Scenario 3: reasoning paragraph must render").toBeVisible();
    const reasoningText = (await reasoning.innerText()).trim();
    expect(reasoningText.length, "reasoning must be non-trivial").toBeGreaterThan(40);

    // ----- Factor / priceFactors tag list -----
    const factorTags = page.getByTestId("factor-tags");
    await expect(factorTags, "Scenario 3: factor tag list must render").toBeVisible();
    // At least one factor chip.
    const firstFactor = page.getByTestId("factor-tag-0");
    await expect(firstFactor).toBeVisible();
    const factorChipCount = await page.locator('[data-testid^="factor-tag-"]').count();
    expect(factorChipCount, "expect ≥1 factor chip").toBeGreaterThan(0);

    // ----- Internal breakdown table -----
    const breakdown = page.getByTestId("card-breakdown");
    await expect(breakdown, "Scenario 3: internal breakdown card must render").toBeVisible();
    const breakdownText = (await breakdown.innerText()).toLowerCase();
    // Must include at least a couple of the breakdown row labels.
    expect(breakdownText).toContain("anchor");
    expect(breakdownText).toContain("mileage adjustment");

    // ----- Comps table with URL + accident signal column -----
    const compsCard = page.getByTestId("card-comps");
    await expect(compsCard, "Scenario 3: comps card must render").toBeVisible();
    const compsTable = page.getByTestId("table-comps");
    await expect(compsTable).toBeVisible();
    const rowCount = await page.locator('[data-testid^="row-comp-"]').count();
    expect(rowCount, "expect ≥1 comp row").toBeGreaterThan(0);

    // Column headers — accident-signal column is required.
    const tableHtml = (await compsTable.innerHTML()).toLowerCase();
    expect(tableHtml).toContain("source");
    expect(tableHtml).toContain("asking");
    expect(tableHtml).toContain("accident signal");
    expect(tableHtml).toContain("description");

    // At least one comp row should expose a "View listing" URL — real-Claude
    // comps from this pipeline include external listing links.
    const firstRow = page.getByTestId("row-comp-0");
    const firstRowText = await firstRow.innerText();
    expect(firstRowText.length).toBeGreaterThan(0);
    const viewListing = compsCard.getByText(/view listing/i).first();
    await expect(viewListing).toBeVisible();
  });
});
