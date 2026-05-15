import type { Express, Response } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../storage";
import { requireStaff, type StaffAuthRequest } from "../middleware/require-staff";
import { readResult } from "@shared/appraisal-result";
import type { InsertInquiry } from "@shared/schema";
import type { AppraisalStatus } from "../storage";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offerRequestsOnly: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
  search: z.string().max(200).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const patchSchema = z.object({
  staffNotes: z
    .union([z.string().max(5000), z.null()])
    .optional(),
  quotedPriceCad: z
    .union([z.number().int().min(0).max(10_000_000), z.null()])
    .optional(),
});

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export function registerAdminAppraisalRoutes(app: Express) {
  // GET /api/admin/appraisals/cost-summary — aggregate Anthropic cost (Task #22)
  // NOTE: Registered before the `/:id` route so "cost-summary" isn't parsed as
  // a numeric id.
  app.get("/api/admin/appraisals/cost-summary", requireStaff, async (req: StaffAuthRequest, res: Response) => {
    try {
      const daysRaw = Number(req.query.days);
      const windowDays = Number.isFinite(daysRaw) && daysRaw > 0 && daysRaw <= 365 ? Math.floor(daysRaw) : 30;
      const summary = await storage.getAppraisalCostSummary(windowDays);
      res.json(summary);
    } catch (err) {
      console.error("Error fetching appraisal cost summary:", err);
      res.status(500).json({ message: "Failed to fetch cost summary" });
    }
  });

  // GET /api/admin/appraisals — paginated list + filters
  app.get("/api/admin/appraisals", requireStaff, async (req: StaffAuthRequest, res: Response) => {
    try {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ message: fromZodError(parsed.error).message });
      }
      const { page, limit, offerRequestsOnly, search, dateFrom, dateTo } = parsed.data;

      const result = await storage.listAppraisalsForStaff({
        page,
        limit,
        offerRequestsOnly,
        search,
        dateFrom: parseDate(dateFrom),
        dateTo: parseDate(dateTo),
      });

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const offerRequestCount7d = await storage.countOfferRequestsSince(sevenDaysAgo);

      res.json({ ...result, offerRequestCount7d });
    } catch (err) {
      console.error("Error listing staff appraisals:", err);
      res.status(500).json({ message: "Failed to list appraisals" });
    }
  });

  // GET /api/admin/appraisals/:id — full detail + audit log
  app.get("/api/admin/appraisals/:id", requireStaff, async (req: StaffAuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid appraisal ID" });

      const appraisal = await storage.getAppraisal(id);
      if (!appraisal) return res.status(404).json({ message: "Appraisal not found" });

      const auditLog = await storage.getAppraisalAuditLog(id);

      let inquiry = null;
      if (appraisal.inquiryId) {
        try {
          inquiry = await storage.getInquiryById(appraisal.inquiryId);
        } catch (e) {
          // Best-effort enrichment; do not fail the request.
          console.error("Failed to load related inquiry:", e);
        }
      }

      // Record staff-view audit event (best effort)
      storage
        .logAppraisalAudit({
          appraisalId: id,
          event: "staff_viewed",
          actor: req.staff?.username ?? null,
          details: null,
        })
        .catch((e) => console.error("Failed to log staff_viewed audit:", e));

      res.json({ appraisal, auditLog, inquiry });
    } catch (err) {
      console.error("Error fetching appraisal detail:", err);
      res.status(500).json({ message: "Failed to fetch appraisal" });
    }
  });

  // PATCH /api/admin/appraisals/:id — staff notes + quoted price
  app.patch("/api/admin/appraisals/:id", requireStaff, async (req: StaffAuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid appraisal ID" });

      const parsed = patchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromZodError(parsed.error).message });
      }
      const update = parsed.data;
      if (update.staffNotes === undefined && update.quotedPriceCad === undefined) {
        return res.status(400).json({ message: "Provide staffNotes or quotedPriceCad" });
      }

      const before = await storage.getAppraisal(id);
      if (!before) return res.status(404).json({ message: "Appraisal not found" });

      const updated = await storage.updateAppraisalStaffFields(id, update);
      if (!updated) return res.status(404).json({ message: "Appraisal not found" });

      const beforeStaff = readResult(before.result).staff ?? {};
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      if (update.staffNotes !== undefined && beforeStaff.staffNotes !== update.staffNotes) {
        changes.staffNotes = { from: beforeStaff.staffNotes ?? null, to: update.staffNotes };
      }
      if (update.quotedPriceCad !== undefined && beforeStaff.quotedPriceCad !== update.quotedPriceCad) {
        changes.quotedPriceCad = { from: beforeStaff.quotedPriceCad ?? null, to: update.quotedPriceCad };
      }

      if (Object.keys(changes).length > 0) {
        await storage.logAppraisalAudit({
          appraisalId: id,
          event: "staff_updated",
          actor: req.staff?.username ?? null,
          details: { changes },
        });
      }

      res.json(updated);
    } catch (err) {
      console.error("Error updating appraisal:", err);
      res.status(500).json({ message: "Failed to update appraisal" });
    }
  });

  // POST /api/admin/appraisals/:id/retry-lead — re-attempt inquiry creation
  app.post("/api/admin/appraisals/:id/retry-lead", requireStaff, async (req: StaffAuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid appraisal ID" });

      const appraisal = await storage.getAppraisal(id);
      if (!appraisal) return res.status(404).json({ message: "Appraisal not found" });

      if (appraisal.inquiryId) {
        return res.status(400).json({ message: "Appraisal already has a linked inquiry" });
      }

      // Build an inquiry from the appraisal contact + vehicle data.
      const vehicleStr = [appraisal.year, appraisal.make, appraisal.model, appraisal.trim]
        .filter(Boolean)
        .join(" ");
      const inquiryInput: InsertInquiry = {
        name: appraisal.name,
        email: appraisal.email,
        phone: appraisal.phone ?? null,
        subject: `Appraisal offer request — ${vehicleStr}`,
        message:
          `Customer requested a firm offer for their ${vehicleStr}` +
          (appraisal.mileage ? ` (${appraisal.mileage.toLocaleString()} km)` : "") +
          (appraisal.postalCode ? `. Postal: ${appraisal.postalCode}` : "") +
          ".",
        vehicleId: null,
        appraisalId: appraisal.id,
      };
      const inquiry = await storage.createInquiry(inquiryInput);

      // Clear the leadInquiryError flag in result and link the inquiry.
      const existingResult = readResult(appraisal.result);
      const { leadInquiryError: _drop, ...resultRest } = existingResult;
      await storage.updateAppraisalWithResult(id, {
        status: appraisal.status as AppraisalStatus,
        result: resultRest,
        inquiryId: inquiry.id,
      });

      await storage.logAppraisalAudit({
        appraisalId: id,
        event: "lead_retry_success",
        actor: req.staff?.username ?? null,
        details: { inquiryId: inquiry.id },
      });

      res.json({ ok: true, inquiry });
    } catch (err) {
      console.error("Error retrying lead routing:", err);
      try {
        const id = parseInt(req.params.id, 10);
        if (!isNaN(id)) {
          await storage.logAppraisalAudit({
            appraisalId: id,
            event: "lead_retry_failed",
            actor: req.staff?.username ?? null,
            details: { error: (err as Error)?.message ?? "unknown" },
          });
        }
      } catch {}
      res.status(500).json({ message: "Failed to retry lead routing" });
    }
  });
}
