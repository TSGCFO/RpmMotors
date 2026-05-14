import crypto from "node:crypto";
import type { Request } from "express";
import { storage } from "../storage";

export const IP_HOUR_LIMIT = 5;
export const IP_DAY_LIMIT = 20;
export const EMAIL_HOUR_LIMIT = 3;
export const EMAIL_DAY_LIMIT = 10;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function getClientIp(req: Request): string | null {
  const fwd = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
  return fwd || req.socket.remoteAddress || null;
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.APPRAISAL_RATE_LIMIT_IP_SALT || "dev-appraisal-ip-salt";
  return crypto.createHash("sha256").update(`${salt}|${ip}`).digest("hex");
}

export interface RateLimitDecision {
  allowed: boolean;
  reason?: "ip_hour" | "ip_day" | "email_hour" | "email_day";
}

export async function checkAppraisalRateLimit(params: {
  ipHash: string | null;
  email: string;
  now?: Date;
}): Promise<RateLimitDecision> {
  const now = params.now ?? new Date();

  const hourly = await storage.countRecentAppraisalsByIpOrEmail({
    ipHash: params.ipHash,
    email: params.email,
    windowMs: HOUR_MS,
    now,
  });
  if (params.ipHash && hourly.ipCount >= IP_HOUR_LIMIT) {
    return { allowed: false, reason: "ip_hour" };
  }
  if (hourly.emailCount >= EMAIL_HOUR_LIMIT) {
    return { allowed: false, reason: "email_hour" };
  }

  const daily = await storage.countRecentAppraisalsByIpOrEmail({
    ipHash: params.ipHash,
    email: params.email,
    windowMs: DAY_MS,
    now,
  });
  if (params.ipHash && daily.ipCount >= IP_DAY_LIMIT) {
    return { allowed: false, reason: "ip_day" };
  }
  if (daily.emailCount >= EMAIL_DAY_LIMIT) {
    return { allowed: false, reason: "email_day" };
  }

  return { allowed: true };
}
