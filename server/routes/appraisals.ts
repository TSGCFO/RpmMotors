import type { Express, Request, Response } from "express";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { insertAppraisalSchema } from "@shared/schema";
import { storage } from "../storage";
import { verifyTurnstileToken } from "../appraisal/turnstile";
import {
  checkAppraisalRateLimit,
  getClientIp,
  hashIp,
} from "../appraisal/rate-limit";
import {
  signAppraisalStatusToken,
  verifyAppraisalStatusToken,
} from "../appraisal/status-token";
import {
  dispatchAppraisalOrchestration,
  type OrchestratorOptions,
} from "../appraisal/orchestrator";

// Body sent by the public form (vehicle + condition + contact merged).
// Maps to insertAppraisalSchema with a few client-only fields.
const appraisalRequestSchema = insertAppraisalSchema
  .extend({
    // Optional client-side fields that aren't part of the DB schema.
    firstName: z.string().trim().min(1).max(60).optional(),
    lastName: z.string().trim().min(1).max(60).optional(),
    bodyType: z.string().max(40).optional().nullable(),
    condition: z.string().max(40).optional().nullable(),
    issues: z.string().max(500).optional().nullable(),
    previousOwners: z.string().max(10).optional().nullable(),
    serviceRecords: z.string().max(40).optional().nullable(),
    features: z.array(z.string().max(60)).max(50).optional(),
    wantsOffer: z.boolean().optional(),
    turnstileToken: z.string().optional(),
    // Honeypot: any non-empty value indicates a bot.
    website: z.string().optional(),
  })
  .passthrough();

interface AppraisalRouteDeps {
  /** Test seam: replace orchestrator dispatch. */
  dispatchOrchestration?: (
    appraisalId: number,
    wantsOffer: boolean,
    options?: OrchestratorOptions,
  ) => void;
  /** Test seam: replace turnstile verification. */
  verifyTurnstile?: typeof verifyTurnstileToken;
}

export function registerAppraisalRoutes(app: Express, deps: AppraisalRouteDeps = {}): void {
  const dispatch = deps.dispatchOrchestration ?? dispatchAppraisalOrchestration;
  const verifyTs = deps.verifyTurnstile ?? verifyTurnstileToken;

  app.post("/api/appraisals", async (req: Request, res: Response) => {
    try {
      const parsed = appraisalRequestSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({ message: fromZodError(parsed.error).message });
      }
      const data = parsed.data;

      const ip = getClientIp(req);
      const ipHash = hashIp(ip);
      const userAgent = (req.headers["user-agent"] as string | undefined) ?? null;

      // ----- Honeypot: silently return a fake success-shaped response. -----
      if (data.website && data.website.trim().length > 0) {
        // Burn one rate-limit slot to keep abusers metered, but no DB row.
        return res.json({
          appraisalId: "0",
          statusToken: signAppraisalStatusToken(0),
        });
      }

      // ----- Resolve name from firstName/lastName if a single name wasn't given. -----
      let resolvedName = data.name;
      if ((!resolvedName || resolvedName.length === 0) && (data.firstName || data.lastName)) {
        resolvedName = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
      }
      if (!resolvedName) {
        return res.status(400).json({ message: "Name is required" });
      }

      // ----- Rate limit (cheap, no Turnstile call yet) -----
      const decision = await checkAppraisalRateLimit({
        ipHash,
        email: data.email,
      });
      if (!decision.allowed) {
        return res
          .status(429)
          .json({ message: "Too many appraisal requests. Please try again later." });
      }

      // ----- Turnstile verification -----
      const ts = await verifyTs(data.turnstileToken ?? null, ip);
      if (!ts.success) {
        return res
          .status(400)
          .json({ message: "Verification failed. Please refresh and try again." });
      }

      // ----- Merge client-only condition fields into conditionNotes if absent -----
      const conditionNotesBits: string[] = [];
      if (data.conditionNotes) conditionNotesBits.push(data.conditionNotes);
      if (data.issues) conditionNotesBits.push(`Issues: ${data.issues}`);
      if (data.previousOwners) conditionNotesBits.push(`Previous owners: ${data.previousOwners}`);
      if (data.serviceRecords) conditionNotesBits.push(`Service records: ${data.serviceRecords}`);
      if (data.features && data.features.length > 0) {
        conditionNotesBits.push(`Features: ${data.features.join(", ")}`);
      }
      if (data.bodyType) conditionNotesBits.push(`Body type: ${data.bodyType}`);
      const mergedConditionNotes = conditionNotesBits.join(" | ").slice(0, 500) || null;

      const conditionRating = data.conditionRating ?? data.condition ?? null;

      // ----- Insert appraisal row + rate-limit ledger (atomic in storage). -----
      const created = await storage.createAppraisal({
        name: resolvedName,
        email: data.email,
        phone: data.phone ?? null,
        postalCode: data.postalCode ?? null,
        year: data.year,
        make: data.make,
        model: data.model,
        trim: data.trim ?? null,
        mileage: data.mileage,
        vin: data.vin ?? null,
        exteriorColor: data.exteriorColor ?? null,
        transmission: data.transmission ?? null,
        drivetrain: data.drivetrain ?? null,
        conditionRating,
        conditionNotes: mergedConditionNotes,
        modifications: data.modifications ?? null,
        accidentHistory: data.accidentHistory ?? null,
        sellingTimeline: data.sellingTimeline ?? null,
        ipHash,
        userAgent,
        turnstileVerified: !!process.env.TURNSTILE_SECRET_KEY,
      });

      await storage
        .logAppraisalAudit({
          appraisalId: created.id,
          event: "created",
          actor: "system",
          details: { wantsOffer: !!data.wantsOffer },
        })
        .catch((err) => console.error("audit log failed:", err));

      // Async orchestration — never await.
      dispatch(created.id, !!data.wantsOffer);

      return res.json({
        appraisalId: String(created.id),
        statusToken: signAppraisalStatusToken(created.id),
      });
    } catch (err) {
      console.error("Error creating appraisal:", err);
      return res
        .status(500)
        .json({ message: "Unable to process appraisal request. Please try again." });
    }
  });

  app.get("/api/appraisals/:id/status", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        // Pretend it's pending so we don't leak whether an id is valid.
        return res.json({ status: "pending" } as PublicStatusResponse);
      }
      const token = (req.query.token as string | undefined) ?? "";
      const v = verifyAppraisalStatusToken(token, id);
      if (!v.ok) {
        return res.status(401).json({ status: "error" } as PublicStatusResponse);
      }
      const row = await storage.getAppraisal(id);
      if (!row) {
        return res.json({ status: "pending" } as PublicStatusResponse);
      }
      if (row.status === "failed") {
        return res.json({ status: "error" } as PublicStatusResponse);
      }
      if (row.status === "completed" && row.estimatedMid != null) {
        const response: PublicStatusResponse = {
          status: "complete",
          estimatedPriceCad: row.estimatedMid,
        };
        return res.json(response);
      }
      const response: PublicStatusResponse = { status: "pending" };
      return res.json(response);
    } catch (err) {
      console.error("Error fetching appraisal status:", err);
      return res.status(500).json({ status: "error" } as PublicStatusResponse);
    }
  });
}

/**
 * Public response DTO. Intentionally a SEPARATE type from any staff DTO —
 * do not share fields with internal AI result types. Only `status` and (when
 * complete) `estimatedPriceCad` are exposed.
 */
export type PublicStatusResponse =
  | { status: "pending" }
  | { status: "complete"; estimatedPriceCad: number }
  | { status: "error" };
