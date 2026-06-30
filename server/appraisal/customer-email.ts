import { sendEmail } from "../email";

export interface CustomerEmailInput {
  firstName: string;
  estimatedPriceCad: number;
}

export interface RenderedCustomerEmail {
  html: string;
  text: string;
}

function formatCad(n: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Strict-input renderer for the customer-facing appraisal email.
 * Intentionally accepts ONLY firstName + estimatedPriceCad — no reasoning,
 * no comps, no breakdown. This is a privacy/scope boundary.
 */
export function renderCustomerAppraisalEmail(
  input: CustomerEmailInput,
): RenderedCustomerEmail {
  const safeName = escapeHtml(input.firstName.trim() || "there");
  const priceText = formatCad(input.estimatedPriceCad);

  const text = [
    `Hi ${input.firstName.trim() || "there"},`,
    "",
    `Thanks for using RPM Auto's free AI vehicle appraisal.`,
    "",
    `Your estimated market value: ${priceText}`,
    "",
    `This is an AI-generated estimate based on current Ontario market data. The final offer for your vehicle depends on an in-person inspection.`,
    "",
    `If you'd like a buyout offer from our team, just reply to this email.`,
    "",
    `— RPM Auto`,
    `https://www.rpmautosales.ca`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background-color: #E31837; color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .content { padding: 24px; }
    .estimate-box { background-color: #f9f9f9; border-left: 4px solid #E31837; padding: 20px; margin: 20px 0; text-align: center; }
    .estimate-label { font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .estimate-value { font-size: 36px; font-weight: bold; color: #000; }
    .footer { background-color: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #777; }
    .disclaimer { font-size: 12px; color: #777; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="header"><h1>Your RPM Auto Vehicle Appraisal</h1></div>
  <div class="content">
    <p>Hi ${safeName},</p>
    <p>Thanks for using RPM Auto's free AI vehicle appraisal.</p>
    <div class="estimate-box">
      <div class="estimate-label">Estimated Market Value</div>
      <div class="estimate-value">${escapeHtml(priceText)}</div>
    </div>
    <p class="disclaimer">This is an AI-generated estimate based on current Ontario market data. The final offer for your vehicle depends on an in-person inspection.</p>
    <p>If you'd like a buyout offer from our team, just reply to this email.</p>
    <p>— RPM Auto</p>
  </div>
  <div class="footer">RPM Auto · <a href="https://www.rpmautosales.ca">rpmautosales.ca</a></div>
</body>
</html>`;

  return { html, text };
}

export async function sendCustomerAppraisalEmail(params: {
  to: string;
  firstName: string;
  estimatedPriceCad: number;
}): Promise<boolean> {
  const { html, text } = renderCustomerAppraisalEmail({
    firstName: params.firstName,
    estimatedPriceCad: params.estimatedPriceCad,
  });
  return sendEmail({
    to: params.to,
    subject: "Your RPM Auto vehicle appraisal estimate",
    html,
    text,
  });
}
