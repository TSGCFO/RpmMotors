const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
}

/**
 * Magic bypass token honored only when (a) NODE_ENV is not "production" and
 * (b) E2E_TEST_BYPASS is explicitly set to "1". The bypass is OFF by default
 * — operators on shared staging must explicitly opt in. Lets Playwright drive
 * the full pipeline through the UI without hitting Cloudflare. NEVER honored
 * in prod.
 */
export const E2E_BYPASS_TOKEN = "__PLAYWRIGHT_E2E_BYPASS__";

function isE2EBypassAllowed(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.E2E_TEST_BYPASS === "1";
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev / unconfigured: allow but log once.
    if (!(globalThis as any).__turnstile_warned__) {
      console.warn("[appraisal] TURNSTILE_SECRET_KEY not set — skipping Turnstile verification");
      (globalThis as any).__turnstile_warned__ = true;
    }
    return { success: true };
  }
  if (token === E2E_BYPASS_TOKEN && isE2EBypassAllowed()) {
    return { success: true };
  }
  if (!token || typeof token !== "string") {
    return { success: false, errorCodes: ["missing-input-response"] };
  }
  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    return {
      success: !!data.success,
      errorCodes: data["error-codes"],
    };
  } catch (err) {
    console.error("[appraisal] Turnstile verify error:", err);
    return { success: false, errorCodes: ["internal-error"] };
  }
}
