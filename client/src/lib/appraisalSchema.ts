import { z } from "zod";

const currentYear = new Date().getFullYear();

export const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"] as const;
export const BODY_TYPES = [
  "Sedan",
  "Coupe",
  "Hatchback",
  "SUV",
  "Crossover",
  "Truck",
  "Van/Minivan",
  "Convertible",
  "Wagon",
  "Other",
] as const;
export const DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD"] as const;
export const ACCIDENT_HISTORY = ["None", "Minor", "Moderate", "Major"] as const;
export const PREVIOUS_OWNERS = ["1", "2", "3", "4+"] as const;
export const SERVICE_RECORDS = ["Complete", "Partial", "None"] as const;

export const FEATURE_OPTIONS = [
  "Leather seats",
  "Sunroof / Moonroof",
  "Navigation system",
  "Backup camera",
  "Heated seats",
  "Ventilated seats",
  "Premium sound system",
  "Adaptive cruise control",
  "Blind-spot monitoring",
  "Apple CarPlay / Android Auto",
  "Third-row seating",
  "Tow package",
];

const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;

export const vehicleStepSchema = z.object({
  year: z.coerce
    .number({ invalid_type_error: "Year is required" })
    .int()
    .min(1980, "Year must be 1980 or later")
    .max(currentYear + 1, `Year cannot be after ${currentYear + 1}`),
  make: z.string().trim().min(1, "Make is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(60),
  trim: z.string().trim().max(60).optional().or(z.literal("")),
  mileage: z.coerce
    .number({ invalid_type_error: "Mileage is required" })
    .int()
    .min(0, "Mileage must be 0 or greater")
    .max(999999, "Mileage seems too high"),
  bodyType: z.enum(BODY_TYPES, {
    errorMap: () => ({ message: "Select a body type" }),
  }),
  drivetrain: z.enum(DRIVETRAINS, {
    errorMap: () => ({ message: "Select a drivetrain" }),
  }),
  vin: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || vinRegex.test(v), "VIN must be 17 characters (no I, O, Q)"),
});

export const conditionStepSchema = z.object({
  condition: z.enum(CONDITIONS, {
    errorMap: () => ({ message: "Select a condition" }),
  }),
  features: z.array(z.string()).default([]),
  issues: z.string().trim().max(500, "Please keep under 500 characters").optional().or(z.literal("")),
  accidentHistory: z.enum(ACCIDENT_HISTORY, {
    errorMap: () => ({ message: "Select accident history" }),
  }),
  previousOwners: z.enum(PREVIOUS_OWNERS, {
    errorMap: () => ({ message: "Select number of previous owners" }),
  }),
  serviceRecords: z.enum(SERVICE_RECORDS, {
    errorMap: () => ({ message: "Select service records availability" }),
  }),
});

export const contactStepSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30, "Enter a valid phone number"),
  postalCode: z
    .string()
    .trim()
    .min(1, "Postal code is required")
    .refine(
      (v) => postalCodeRegex.test(v),
      "Enter a valid Canadian postal code (e.g. L4E 3N8)",
    ),
  wantsOffer: z.boolean().default(false),
  turnstileToken: z.string().optional().or(z.literal("")),
});

export const appraisalFullSchema = vehicleStepSchema
  .merge(conditionStepSchema)
  .merge(contactStepSchema);

export type VehicleStepValues = z.infer<typeof vehicleStepSchema>;
export type ConditionStepValues = z.infer<typeof conditionStepSchema>;
export type ContactStepValues = z.infer<typeof contactStepSchema>;
export type AppraisalFormValues = z.infer<typeof appraisalFullSchema>;
