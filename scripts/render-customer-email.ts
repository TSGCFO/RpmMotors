import { renderCustomerAppraisalEmail } from "../server/appraisal/customer-email";
import fs from "fs";
const out = renderCustomerAppraisalEmail({ firstName: "Alex", estimatedPriceCad: 24650 });
fs.writeFileSync("screenshots/customer-email-preview.html", out.html);
console.log("subject:", out.subject);
console.log("html bytes:", out.html.length);
const forbidden = ["autotrader", "cargurus", "anthropic", "claude", "openai", "reasoning", "factor", "confidence"];
const lower = out.html.toLowerCase();
for (const w of forbidden) {
  if (lower.includes(w)) {
    console.error("LEAK:", w);
    process.exit(1);
  }
}
console.log("email leakage scan: clean");
