const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
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
