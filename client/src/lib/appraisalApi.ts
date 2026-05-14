import { AppraisalFormValues } from "./appraisalSchema";

export interface AppraisalSubmitResponse {
  appraisalId: string;
  statusToken: string;
}

export type AppraisalStatusState = "pending" | "processing" | "completed" | "failed";

export interface AppraisalStatusResponse {
  status: AppraisalStatusState;
  estimatedValueCad?: number;
  error?: string;
}

const USE_MOCK = true;

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function mockEstimate(values: AppraisalFormValues): number {
  const age = Math.max(0, new Date().getFullYear() - values.year);
  const base = 38000 - age * 1500 - Math.min(values.mileage, 300000) * 0.06;
  const condMul: Record<string, number> = {
    Excellent: 1.1,
    Good: 1,
    Fair: 0.85,
    Poor: 0.7,
  };
  const accMul: Record<string, number> = {
    None: 1,
    Minor: 0.93,
    Moderate: 0.82,
    Major: 0.65,
  };
  const featureBoost = 1 + Math.min(values.features?.length ?? 0, 6) * 0.015;
  const raw = base * (condMul[values.condition] ?? 1) * (accMul[values.accidentHistory] ?? 1) * featureBoost;
  return Math.max(2500, Math.round(raw / 250) * 250);
}

const mockStore = new Map<string, { token: string; value: number; readyAt: number }>();

export async function submitAppraisal(
  values: AppraisalFormValues,
): Promise<AppraisalSubmitResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const appraisalId = randomId();
    const statusToken = randomId();
    mockStore.set(appraisalId, {
      token: statusToken,
      value: mockEstimate(values),
      readyAt: Date.now() + 4500,
    });
    return { appraisalId, statusToken };
  }
  const res = await fetch("/api/appraisals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  return res.json();
}

export async function getAppraisalStatus(
  appraisalId: string,
  token: string,
): Promise<AppraisalStatusResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    const entry = mockStore.get(appraisalId);
    if (!entry || entry.token !== token) {
      return { status: "failed", error: "Not found" };
    }
    if (Date.now() < entry.readyAt) return { status: "processing" };
    return { status: "completed", estimatedValueCad: entry.value };
  }
  const res = await fetch(
    `/api/appraisals/${encodeURIComponent(appraisalId)}/status?token=${encodeURIComponent(token)}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error(`Status check failed (${res.status})`);
  return res.json();
}

export function formatCad(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}
