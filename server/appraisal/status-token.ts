import crypto from "node:crypto";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

function getSecret(): string {
  const s =
    process.env.APPRAISAL_STATUS_TOKEN_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.APPRAISAL_RATE_LIMIT_IP_SALT ||
    "dev-appraisal-status-token-secret";
  return s;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export interface SignOptions {
  ttlMs?: number;
  now?: number;
}

export function signAppraisalStatusToken(appraisalId: number, opts: SignOptions = {}): string {
  const now = opts.now ?? Date.now();
  const exp = now + (opts.ttlMs ?? DEFAULT_TTL_MS);
  const payload = `${appraisalId}.${exp}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest();
  return `${payload}.${b64url(sig)}`;
}

export interface VerifyResult {
  ok: boolean;
  appraisalId?: number;
  reason?: "malformed" | "bad_signature" | "expired" | "id_mismatch";
}

export function verifyAppraisalStatusToken(
  token: string,
  expectedAppraisalId: number,
  now: number = Date.now(),
): VerifyResult {
  if (!token || typeof token !== "string") return { ok: false, reason: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [idStr, expStr, sigB64] = parts;
  const appraisalId = Number(idStr);
  const exp = Number(expStr);
  if (!Number.isFinite(appraisalId) || !Number.isFinite(exp)) {
    return { ok: false, reason: "malformed" };
  }
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(`${idStr}.${expStr}`)
    .digest();
  let provided: Buffer;
  try {
    provided = b64urlDecode(sigB64);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return { ok: false, reason: "bad_signature" };
  }
  if (appraisalId !== expectedAppraisalId) return { ok: false, reason: "id_mismatch" };
  if (now > exp) return { ok: false, reason: "expired" };
  return { ok: true, appraisalId };
}
