import { test, devices } from "@playwright/test";
test("mobile screenshot", async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  await page.goto((process.env.E2E_BASE_URL ?? "http://localhost:5001") + "/value-my-car");
  await page.waitForSelector("[data-testid=form-vehicle-step]");
  await page.screenshot({ path: "screenshots/value-my-car-mobile.jpg", fullPage: false });
  await ctx.close();
});
test("tablet screenshot", async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices["iPad Mini"] });
  const page = await ctx.newPage();
  await page.goto((process.env.E2E_BASE_URL ?? "http://localhost:5001") + "/value-my-car");
  await page.waitForSelector("[data-testid=form-vehicle-step]");
  await page.screenshot({ path: "screenshots/value-my-car-tablet.jpg", fullPage: false });
  await ctx.close();
});
