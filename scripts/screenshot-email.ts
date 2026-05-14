import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const html = fs.readFileSync(
  path.resolve("screenshots/customer-email-preview.html"),
  "utf8",
);

const VIEWPORTS = [
  { name: "gmail-desktop", width: 800, height: 1200 },
  { name: "outlook-desktop", width: 720, height: 1200 },
  { name: "apple-mail-mobile", width: 414, height: 900 },
];

(async () => {
  const browser = await chromium.launch();
  try {
    for (const v of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: v.width, height: v.height },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const out = `screenshots/customer-email-${v.name}.jpg`;
      await page.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 88 });
      console.log(`wrote ${out} (${v.width}×${v.height})`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
