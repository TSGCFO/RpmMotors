import { storage } from "../storage";
import type { Appraisal } from "@shared/schema";

export interface LeadRoutingResult {
  inquiryId?: number;
  error?: string;
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export function buildLeadInquiryMessage(appraisal: Appraisal, estimatedPriceCad: number): string {
  const lines = [
    `An appraisal customer has requested a buyout offer.`,
    ``,
    `Customer: ${appraisal.name} <${appraisal.email}>`,
    `Phone: ${fmt(appraisal.phone)}`,
    `Postal code: ${fmt(appraisal.postalCode)}`,
    ``,
    `Vehicle:`,
    `  Year/Make/Model: ${appraisal.year} ${appraisal.make} ${appraisal.model}`,
    `  Trim: ${fmt(appraisal.trim)}`,
    `  Mileage (km): ${appraisal.mileage.toLocaleString("en-CA")}`,
    `  VIN: ${fmt(appraisal.vin)}`,
    `  Exterior color: ${fmt(appraisal.exteriorColor)}`,
    `  Transmission: ${fmt(appraisal.transmission)}`,
    `  Drivetrain: ${fmt(appraisal.drivetrain)}`,
    `  Condition: ${fmt(appraisal.conditionRating)}`,
    `  Accident history: ${fmt(appraisal.accidentHistory)}`,
    `  Selling timeline: ${fmt(appraisal.sellingTimeline)}`,
    `  Condition notes: ${fmt(appraisal.conditionNotes)}`,
    `  Modifications: ${fmt(appraisal.modifications)}`,
    ``,
    `AI estimate: $${estimatedPriceCad.toLocaleString("en-CA")} CAD`,
    ``,
    `Internal link: /employee/appraisals/${appraisal.id}`,
  ];
  return lines.join("\n");
}

/**
 * Insert an inquiry record tied to the appraisal so the existing staff
 * inbox + notification flow handles the lead. Returns the new inquiry id or
 * an error string for storage on the appraisal row.
 */
export async function routeAppraisalLead(
  appraisal: Appraisal,
  estimatedPriceCad: number,
): Promise<LeadRoutingResult> {
  try {
    const subject = `Appraisal offer request — ${appraisal.year} ${appraisal.make} ${appraisal.model}`;
    const message = buildLeadInquiryMessage(appraisal, estimatedPriceCad);
    const inquiry = await storage.createInquiry({
      name: appraisal.name,
      email: appraisal.email,
      phone: appraisal.phone ?? null,
      subject,
      message,
      vehicleId: null,
      appraisalId: appraisal.id,
    } as any);
    return { inquiryId: inquiry.id };
  } catch (err: any) {
    const msg = err?.message ? String(err.message) : String(err);
    console.error(`[appraisal #${appraisal.id}] lead routing failed:`, msg);
    return { error: msg.slice(0, 500) };
  }
}
