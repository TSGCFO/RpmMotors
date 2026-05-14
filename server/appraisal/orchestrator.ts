import { storage, type AppraisalStatus } from "../storage";
import { runAppraisalPipeline, type AppraisalPipelineOptions } from "./pipeline";
import { sendCustomerAppraisalEmail } from "./customer-email";
import { routeAppraisalLead } from "./lead-routing";
import type { Appraisal } from "@shared/schema";

export interface OrchestratorOptions {
  pipelineOptions?: AppraisalPipelineOptions;
  /** Skip async email/lead side-effects (for unit tests). */
  skipSideEffects?: boolean;
  /** Override email sender (tests). */
  emailSender?: (params: { to: string; firstName: string; estimatedPriceCad: number }) => Promise<boolean>;
  /** Override lead router (tests). */
  leadRouter?: (appraisal: Appraisal, estimatedPriceCad: number) => Promise<{ inquiryId?: number; error?: string }>;
}

function firstNameFromAppraisal(a: Appraisal): string {
  const parts = (a.name || "").trim().split(/\s+/);
  return parts[0] || "there";
}

/**
 * Runs the AI pipeline for an existing appraisal row, persists results,
 * sends the customer email, and routes a lead inquiry if requested.
 *
 * Idempotent: if the appraisal already has emailSentAt set, the email is
 * not re-sent on retry. If an inquiry has already been created for an
 * opt-in lead, another is not created.
 */
export async function runAppraisalOrchestration(
  appraisalId: number,
  wantsOffer: boolean,
  options: OrchestratorOptions = {},
): Promise<void> {
  const appraisal = await storage.getAppraisal(appraisalId);
  if (!appraisal) {
    console.error(`[appraisal #${appraisalId}] orchestrator: row not found`);
    return;
  }

  // If already completed (retry), skip pipeline; still apply side-effects below.
  let estimatedPriceCad: number | null = appraisal.estimatedMid ?? null;
  let pipelineSucceeded = appraisal.status === "completed";

  if (appraisal.status !== "completed") {
    await storage.setAppraisalStatus(appraisalId, "stage1_running" as AppraisalStatus);
    try {
      const result = await runAppraisalPipeline(
        {
          year: appraisal.year,
          make: appraisal.make,
          model: appraisal.model,
          trim: appraisal.trim,
          mileageKm: appraisal.mileage,
          postalCode: appraisal.postalCode,
          conditionRating: appraisal.conditionRating,
          accidentHistory: appraisal.accidentHistory,
        },
        options.pipelineOptions,
      );
      estimatedPriceCad = result.stage2.estimatedPriceCad;
      await storage.updateAppraisalWithResult(appraisalId, {
        status: "completed",
        result: {
          stage1: result.stage1,
          stage2: result.stage2,
          meta: result.meta,
        } as unknown as Record<string, unknown>,
        estimatedMid: estimatedPriceCad,
        estimatedLow: null,
        estimatedHigh: null,
        errorMessage: null,
      });
      await storage.logAppraisalAudit({
        appraisalId,
        event: "completed",
        actor: "system",
        details: {
          estimatedPriceCad,
          modelUsed: result.meta.modelUsed,
          stage1DurationMs: result.meta.stage1DurationMs,
          stage2DurationMs: result.meta.stage2DurationMs,
          cacheHit: result.meta.cacheHit,
        },
      });
      pipelineSucceeded = true;
    } catch (err: any) {
      const message = err?.message ? String(err.message) : String(err);
      console.error(`[appraisal #${appraisalId}] pipeline failed:`, message);
      await storage.updateAppraisalWithResult(appraisalId, {
        status: "failed",
        errorMessage: message.slice(0, 1000),
      });
      await storage.logAppraisalAudit({
        appraisalId,
        event: "failed",
        actor: "system",
        details: { message: message.slice(0, 500) },
      });
      return;
    }
  }

  if (options.skipSideEffects || !pipelineSucceeded || estimatedPriceCad == null) return;

  // Refresh appraisal in case of changes (we need latest emailSentAt + inquiryId).
  const current = await storage.getAppraisal(appraisalId);
  if (!current) return;

  // ----- Customer email (gated by emailSentAt for idempotency) -----
  if (!current.emailSentAt) {
    const send = options.emailSender ?? sendCustomerAppraisalEmail;
    try {
      const ok = await send({
        to: current.email,
        firstName: firstNameFromAppraisal(current),
        estimatedPriceCad,
      });
      if (ok) {
        await storage.updateAppraisalWithResult(appraisalId, {
          status: "completed",
          emailSentAt: new Date(),
          emailError: null,
        });
        await storage.logAppraisalAudit({
          appraisalId,
          event: "email_sent",
          actor: "system",
        });
      } else {
        await storage.updateAppraisalWithResult(appraisalId, {
          status: "completed",
          emailError: "SendGrid returned a non-success response",
        });
      }
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : String(err);
      console.error(`[appraisal #${appraisalId}] customer email error:`, msg);
      await storage.updateAppraisalWithResult(appraisalId, {
        status: "completed",
        emailError: msg.slice(0, 500),
      });
    }
  }

  // ----- Lead routing (only if requested, and only once) -----
  if (wantsOffer && !current.inquiryId) {
    const router = options.leadRouter ?? routeAppraisalLead;
    const out = await router(current, estimatedPriceCad);
    if (out.inquiryId) {
      await storage.updateAppraisalWithResult(appraisalId, {
        status: "completed",
        inquiryId: out.inquiryId,
        staffNotified: true,
        leadInquiryError: null,
      });
      await storage.logAppraisalAudit({
        appraisalId,
        event: "lead_routed",
        actor: "system",
        details: { inquiryId: out.inquiryId },
      });
    } else if (out.error) {
      await storage.updateAppraisalWithResult(appraisalId, {
        status: "completed",
        leadInquiryError: out.error,
      });
    }
  }
}

/** Fire-and-forget wrapper used by the HTTP handler. */
export function dispatchAppraisalOrchestration(
  appraisalId: number,
  wantsOffer: boolean,
  options: OrchestratorOptions = {},
): void {
  setImmediate(() => {
    runAppraisalOrchestration(appraisalId, wantsOffer, options).catch((err) => {
      console.error(`[appraisal #${appraisalId}] orchestrator dispatch error:`, err);
    });
  });
}
