import { AppraisalFormValues } from "./appraisalSchema";

export interface AppraisalSubmitResponse {
  appraisalId: string;
  statusToken: string;
}

export type AppraisalStatusState = "pending" | "complete" | "error";

export interface AppraisalStatusResponse {
  status: AppraisalStatusState;
  estimatedPriceCad?: number;
}

export async function submitAppraisal(
  values: AppraisalFormValues,
): Promise<AppraisalSubmitResponse> {
  const res = await fetch("/api/appraisals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
    credentials: "include",
  });
  if (!res.ok) {
    let message = `Submission failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* noop */
    }
    if (res.status === 429) {
      message = "Too many appraisal requests right now. Please try again in a little while.";
    }
    throw new Error(message);
  }
  return res.json();
}

export async function getAppraisalStatus(
  appraisalId: string,
  token: string,
): Promise<AppraisalStatusResponse> {
  const res = await fetch(
    `/api/appraisals/${encodeURIComponent(appraisalId)}/status?token=${encodeURIComponent(token)}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    return { status: "error" };
  }
  return res.json();
}

export function formatCad(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}
