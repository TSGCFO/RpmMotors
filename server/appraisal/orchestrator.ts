import { storage, type AppraisalStatus } from "../storage";
import { runAppraisalPipeline, type AppraisalPipelineOptions } from "./pipeline";
import { sendCustomerAppraisalEmail } from "./customer-email";
import { routeAppraisalLead } from "./lead-routing";
import { computeAnthropicCostCents } from "./cost";
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

  // E2E fast path: when E2E_FAST_PIPELINE=1 and not in production, return a
  // deterministic canned result without calling Claude. Used by Playwright
  // scenarios 1 and 2 so the UI round-trip completes inside the test budget.
  // NEVER honored in production.
  const e2eFast =
    process.env.NODE_ENV !== "production" &&
    process.env.E2E_FAST_PIPELINE === "1";

  if (appraisal.status !== "completed" && e2eFast) {
    await storage.setAppraisalStatus(appraisalId, "stage1_running" as AppraisalStatus);
    estimatedPriceCad = 18500;
    await storage.updateAppraisalWithResult(appraisalId, {
      status: "completed",
      result: {
        stage2: { estimatedPriceCad, confidence: "medium" },
        meta: { modelUsed: "e2e-fast-stub", stage1DurationMs: 1, stage2DurationMs: 1, cacheHit: false },
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
      details: { estimatedPriceCad, modelUsed: "e2e-fast-stub", stage1DurationMs: 1, stage2DurationMs: 1, cacheHit: false },
    });
    pipelineSucceeded = true;
  } else if (appraisal.status !== "completed") {
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
      // ---- Cost tracking (Task #22) ----
      // Computed best-effort: if any field is missing/throws we persist null
      // costs but still mark the appraisal completed. The appraisal MUST
      // never fail because of a billing-side issue.
      const s1u = result.meta.stage1Usage;
      const s2u = result.meta.stage2Usage;
      let s1CostCents: number | null = null;
      let s2CostCents: number | null = null;
      let totalCostCents: number | null = null;
      try {
        s1CostCents = s1u
          ? computeAnthropicCostCents({
              model: s1u.model,
              inputTokens: s1u.inputTokens,
              outputTokens: s1u.outputTokens,
              cacheCreationTokens: s1u.cacheCreationTokens,
              cacheReadTokens: s1u.cacheReadTokens,
            })
          : 0;
        s2CostCents = computeAnthropicCostCents({
          model: s2u.model,
          inputTokens: s2u.inputTokens,
          outputTokens: s2u.outputTokens,
          cacheCreationTokens: s2u.cacheCreationTokens,
          cacheReadTokens: s2u.cacheReadTokens,
        });
        totalCostCents = s1CostCents + s2CostCents;
      } catch (costErr) {
        console.error(`[appraisal #${appraisalId}] cost computation failed:`, costErr);
        s1CostCents = null;
        s2CostCents = null;
        totalCostCents = null;
      }
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
        stage1Model: s1u?.model ?? null,
        stage1InputTokens: s1u?.inputTokens ?? null,
        stage1OutputTokens: s1u?.outputTokens ?? null,
        stage1CacheCreationTokens: s1u?.cacheCreationTokens ?? null,
        stage1CacheReadTokens: s1u?.cacheReadTokens ?? null,
        stage2Model: s2u.model ?? null,
        stage2InputTokens: s2u.inputTokens ?? null,
        stage2OutputTokens: s2u.outputTokens ?? null,
        stage2CacheCreationTokens: s2u.cacheCreationTokens ?? null,
        stage2CacheReadTokens: s2u.cacheReadTokens ?? null,
        stage1CostCents: s1CostCents,
        stage2CostCents: s2CostCents,
        totalCostCents,
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
          stage1CostCents: s1CostCents,
          stage2CostCents: s2CostCents,
          totalCostCents,
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
