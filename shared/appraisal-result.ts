/**
 * Shape of the JSON stored in `appraisals.result`. The DB column is typed as
 * `Record<string, unknown>`, but the AI pipeline + staff-edit flow writes a
 * known structure documented here so the staff UI and admin routes can
 * consume it without `as any` casts.
 */

export interface AppraisalComp {
  source?: string;
  url?: string;
  title?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  mileage?: number | null;
  priceCad?: number | null;
  postedAt?: string | null;
  notes?: string | null;
}

export interface AppraisalBreakdown {
  baseValue?: number;
  adjustments?: Array<{ label: string; amount: number }>;
  finalLow?: number;
  finalHigh?: number;
  finalMid?: number;

  // Pipeline-specific fields written by the current AI scorer. Optional so the
  // staff UI can render rows generically without enabling them all at once.
  anchor?: number;
  mileageAdj?: number;
  conditionPct?: number;
  accidentPct?: number;
  ownersPct?: number;
  serviceRecordsPct?: number;
  seasonalPct?: number;
  featuresDollars?: number;
  featuresCad?: number;
  cpiPct?: number;
  final?: number;
}

export interface AppraisalStaffFields {
  staffNotes?: string | null;
  quotedPriceCad?: number | null;
}

export interface AppraisalResultData {
  // Top-level (canonical) keys written by the current pipeline
  wantsOffer?: boolean;
  reasoning?: string;
  factorTags?: string[];
  breakdown?: AppraisalBreakdown | null;
  comps?: AppraisalComp[];
  modelUsed?: string;
  stage1DurationMs?: number;
  stage2DurationMs?: number;
  emailSentAt?: string;
  emailError?: string;
  leadInquiryError?: string;

  // Legacy / nested fallback shapes
  stage1?: { comps?: AppraisalComp[] };
  stage2?: { reasoning?: string; factorTags?: string[]; breakdown?: AppraisalBreakdown | null };
  meta?: {
    modelUsed?: string;
    stage1DurationMs?: number;
    stage2DurationMs?: number;
    emailSentAt?: string;
    emailError?: string;
    leadInquiryError?: string;
  };

  // Staff-managed overlay
  staff?: AppraisalStaffFields;
}

export function readResult(value: unknown): AppraisalResultData {
  if (value && typeof value === "object") return value as AppraisalResultData;
  return {};
}
