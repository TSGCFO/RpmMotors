import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, Car, ShieldCheck, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Turnstile } from "@/components/ui/turnstile";
import { useToast } from "@/hooks/use-toast";
import PageMeta from "@/components/seo/page-meta";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  vehicleStepSchema,
  conditionStepSchema,
  contactStepSchema,
  VehicleStepValues,
  ConditionStepValues,
  ContactStepValues,
  AppraisalFormValues,
  CONDITIONS,
  BODY_TYPES,
  DRIVETRAINS,
  ACCIDENT_HISTORY,
  PREVIOUS_OWNERS,
  SERVICE_RECORDS,
  FEATURE_OPTIONS,
} from "@/lib/appraisalSchema";
import {
  submitAppraisal,
  getAppraisalStatus,
  formatCad,
} from "@/lib/appraisalApi";

type StepId = 1 | 2 | 3 | 4;

const STEP_LABELS: { id: StepId; label: string }[] = [
  { id: 1, label: "Vehicle" },
  { id: 2, label: "Condition" },
  { id: 3, label: "Contact" },
  { id: 4, label: "Estimate" },
];

const LOADING_MESSAGES = [
  "Analyzing your vehicle…",
  "Cross-referencing market data…",
  "Calculating market value…",
];

function StepIndicator({ current }: { current: StepId }) {
  return (
    <ol className="flex items-center justify-between gap-2 mb-8" aria-label="Progress">
      {STEP_LABELS.map((s, idx) => {
        const isActive = s.id === current;
        const isDone = s.id < current;
        return (
          <li key={s.id} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border-2 transition-colors ${
                  isActive
                    ? "bg-[#E31837] border-[#E31837] text-white"
                    : isDone
                      ? "bg-black border-black text-white"
                      : "bg-white border-gray-300 text-gray-500"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.id}
              </span>
              <span
                className={`hidden sm:inline text-xs font-semibold uppercase tracking-wide truncate ${
                  isActive ? "text-[#E31837]" : isDone ? "text-black" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-px bg-gray-300 mx-2 sm:mx-4" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function VehicleStep({
  defaults,
  onNext,
}: {
  defaults: Partial<VehicleStepValues>;
  onNext: (v: VehicleStepValues) => void;
}) {
  const form = useForm<VehicleStepValues>({
    resolver: zodResolver(vehicleStepSchema),
    defaultValues: {
      year: defaults.year,
      make: defaults.make ?? "",
      model: defaults.model ?? "",
      trim: defaults.trim ?? "",
      mileage: defaults.mileage,
      bodyType: defaults.bodyType,
      drivetrain: defaults.drivetrain,
      vin: defaults.vin ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-5" data-testid="form-vehicle-step">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2020" {...field} data-testid="input-year" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make *</FormLabel>
                <FormControl>
                  <Input placeholder="Toyota" {...field} data-testid="input-make" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model *</FormLabel>
                <FormControl>
                  <Input placeholder="Camry" {...field} data-testid="input-model" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="trim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trim</FormLabel>
                <FormControl>
                  <Input placeholder="XLE, Sport, etc." {...field} data-testid="input-trim" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mileage (km) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="85000" {...field} data-testid="input-mileage" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bodyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-body-type">
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BODY_TYPES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="drivetrain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drivetrain *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-drivetrain">
                      <SelectValue placeholder="Select drivetrain" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DRIVETRAINS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="17-character VIN"
                  maxLength={17}
                  {...field}
                  data-testid="input-vin"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="bg-[#E31837] hover:bg-[#c01530] text-white px-8"
            data-testid="button-vehicle-next"
          >
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ConditionStep({
  defaults,
  onBack,
  onNext,
}: {
  defaults: Partial<ConditionStepValues>;
  onBack: () => void;
  onNext: (v: ConditionStepValues) => void;
}) {
  const form = useForm<ConditionStepValues>({
    resolver: zodResolver(conditionStepSchema),
    defaultValues: {
      condition: defaults.condition,
      features: defaults.features ?? [],
      issues: defaults.issues ?? "",
      accidentHistory: defaults.accidentHistory,
      previousOwners: defaults.previousOwners,
      serviceRecords: defaults.serviceRecords,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6" data-testid="form-condition-step">
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Condition *</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CONDITIONS.map((c) => {
                  const selected = field.value === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => field.onChange(c)}
                      className={`py-3 rounded border-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                        selected
                          ? "border-[#E31837] bg-[#E31837] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-[#E31837] hover:text-[#E31837]"
                      }`}
                      data-testid={`button-condition-${c.toLowerCase()}`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features (select all that apply)</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FEATURE_OPTIONS.map((feat) => {
                  const checked = field.value?.includes(feat) ?? false;
                  return (
                    <label
                      key={feat}
                      className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors ${
                        checked
                          ? "border-[#E31837] bg-red-50"
                          : "border-gray-300 bg-white hover:border-[#E31837]"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const next = new Set(field.value ?? []);
                          if (v) next.add(feat);
                          else next.delete(feat);
                          field.onChange(Array.from(next));
                        }}
                        data-testid={`checkbox-feature-${feat.replace(/\W+/g, "-").toLowerCase()}`}
                      />
                      <span className="text-sm text-gray-800">{feat}</span>
                    </label>
                  );
                })}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issues"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Known issues or damage (optional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. small scratch on rear bumper, AC needs recharge"
                  {...field}
                  data-testid="input-issues"
                />
              </FormControl>
              <p className="text-xs text-gray-500">Up to 500 characters.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="accidentHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accident History *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-accident-history">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ACCIDENT_HISTORY.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="previousOwners"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Previous Owners *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-previous-owners">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PREVIOUS_OWNERS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceRecords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Records *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-service-records">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SERVICE_RECORDS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack} data-testid="button-condition-back">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button
            type="submit"
            className="bg-[#E31837] hover:bg-[#c01530] text-white px-8"
            data-testid="button-condition-next"
          >
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ContactStep({
  defaults,
  onBack,
  onSubmit,
  submitting,
}: {
  defaults: Partial<ContactStepValues>;
  onBack: () => void;
  onSubmit: (v: ContactStepValues) => void;
  submitting: boolean;
}) {
  const form = useForm<ContactStepValues>({
    resolver: zodResolver(contactStepSchema),
    defaultValues: {
      firstName: defaults.firstName ?? "",
      lastName: defaults.lastName ?? "",
      email: defaults.email ?? "",
      phone: defaults.phone ?? "",
      postalCode: defaults.postalCode ?? "",
      wantsOffer: defaults.wantsOffer ?? false,
      turnstileToken: defaults.turnstileToken ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="form-contact-step">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-first-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-last-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" {...field} data-testid="input-email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="(647) 555-0123" {...field} data-testid="input-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code *</FormLabel>
                <FormControl>
                  <Input placeholder="L4E 3N8" {...field} data-testid="input-postal-code" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="wantsOffer"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-start gap-3 p-4 border border-gray-300 rounded bg-gray-50 cursor-pointer hover:border-[#E31837] transition-colors">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(Boolean(v))}
                    data-testid="checkbox-wants-offer"
                  />
                </FormControl>
                <div>
                  <span className="font-semibold text-gray-900">
                    I'd like RPM Auto to make me an offer on this vehicle
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    A team member will follow up with a buyout offer based on your details.
                  </p>
                </div>
              </label>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="turnstileToken"
          render={({ field }) => (
            <FormItem>
              <Turnstile
                onToken={(t) => field.onChange(t)}
                onError={() => field.onChange("")}
              />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={submitting}
            data-testid="button-contact-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button
            type="submit"
            className="bg-[#E31837] hover:bg-[#c01530] text-white px-8"
            disabled={submitting}
            data-testid="button-contact-submit"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…
              </>
            ) : (
              "Get My Estimate"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function LoadingPanel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="appraisal-loading"
    >
      <Loader2 className="h-12 w-12 text-[#E31837] animate-spin mb-6" />
      <p className="text-lg font-semibold text-gray-900 mb-1">{LOADING_MESSAGES[idx]}</p>
      <p className="text-sm text-gray-500">This usually takes about 15 seconds.</p>
    </div>
  );
}

function ResultPanel({
  estimate,
  onReset,
}: {
  estimate: number;
  onReset: () => void;
}) {
  return (
    <div className="py-8 text-center" data-testid="appraisal-result">
      <div
        className="text-5xl md:text-6xl font-['Poppins'] font-bold text-black mb-2"
        data-testid="text-estimate-value"
      >
        {formatCad(estimate)}
      </div>
      <div
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm"
        data-testid="text-email-confirmation"
      >
        <Check className="h-4 w-4" />
        <span>We've also emailed this estimate to you.</span>
      </div>
      <div className="mt-8">
        <Button
          onClick={onReset}
          variant="outline"
          className="border-[#E31837] text-[#E31837] hover:bg-[#E31837] hover:text-white"
          data-testid="button-start-new-appraisal"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Start a new appraisal
        </Button>
      </div>
    </div>
  );
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export default function ValueMyCar() {
  const { toast } = useToast();
  const [step, setStep] = useState<StepId>(1);
  const [vehicle, setVehicle] = useState<Partial<VehicleStepValues>>({});
  const [condition, setCondition] = useState<Partial<ConditionStepValues>>({});
  const [contact, setContact] = useState<Partial<ContactStepValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"form" | "loading" | "result" | "error">("form");
  const [estimate, setEstimate] = useState<number | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Value My Car", href: "/value-my-car", current: true },
    ],
    [],
  );

  function reset() {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = null;
    setVehicle({});
    setCondition({});
    setContact({});
    setEstimate(null);
    setPhase("form");
    setStep(1);
    setSubmitting(false);
  }

  async function handleFinalSubmit(values: ContactStepValues) {
    setContact(values);
    const composedName = `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim();
    const full = {
      ...(vehicle as VehicleStepValues),
      ...(condition as ConditionStepValues),
      ...values,
      name: composedName,
    } as AppraisalFormValues & { name: string };

    setSubmitting(true);
    setPhase("loading");
    setStep(4);

    try {
      const { appraisalId, statusToken } = await submitAppraisal(full);
      pollRef.current = window.setInterval(async () => {
        try {
          const s = await getAppraisalStatus(appraisalId, statusToken);
          if (s.status === "complete" && typeof s.estimatedPriceCad === "number") {
            if (pollRef.current) window.clearInterval(pollRef.current);
            pollRef.current = null;
            setEstimate(s.estimatedPriceCad);
            setPhase("result");
            setSubmitting(false);
          } else if (s.status === "error") {
            if (pollRef.current) window.clearInterval(pollRef.current);
            pollRef.current = null;
            setPhase("error");
            setSubmitting(false);
            toast({
              title: "We couldn't generate an estimate",
              description: "Please try again in a moment.",
              variant: "destructive",
            });
          }
        } catch (err: unknown) {
          if (pollRef.current) window.clearInterval(pollRef.current);
          pollRef.current = null;
          setPhase("error");
          setSubmitting(false);
          toast({
            title: "Connection issue",
            description: errorMessage(err, "Please try again."),
            variant: "destructive",
          });
        }
      }, 2000);
    } catch (err: unknown) {
      setPhase("error");
      setSubmitting(false);
      toast({
        title: "Submission failed",
        description: errorMessage(err, "Please try again."),
        variant: "destructive",
      });
    }
  }

  return (
    <main className="bg-[#F5F5F5] py-12 min-h-screen">
      <PageMeta
        title="Value My Car | Free AI Vehicle Appraisal | RPM Auto"
        description="Get a free, instant AI-powered estimate for your vehicle's market value in Canada. Optional buyout offer from RPM Auto."
        keywords="car appraisal, vehicle valuation, sell my car, trade-in value, Ontario car value"
        canonical="https://www.rpmautosales.ca/value-my-car"
      />
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E31837]/10 mb-4">
            <Car className="h-7 w-7 text-[#E31837]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-['Poppins'] font-bold text-black mb-3">
            Value My Car
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Get a free, AI-powered estimate of your vehicle's market value. Takes about a minute —
            no obligation.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <StepIndicator current={step} />

          {phase === "form" && step === 1 && (
            <VehicleStep
              defaults={vehicle}
              onNext={(v) => {
                setVehicle(v);
                setStep(2);
              }}
            />
          )}
          {phase === "form" && step === 2 && (
            <ConditionStep
              defaults={condition}
              onBack={() => setStep(1)}
              onNext={(v) => {
                setCondition(v);
                setStep(3);
              }}
            />
          )}
          {phase === "form" && step === 3 && (
            <ContactStep
              defaults={contact}
              onBack={() => setStep(2)}
              onSubmit={handleFinalSubmit}
              submitting={submitting}
            />
          )}
          {phase === "loading" && <LoadingPanel />}
          {phase === "result" && estimate !== null && (
            <ResultPanel estimate={estimate} onReset={reset} />
          )}
          {phase === "error" && (
            <div className="py-12 text-center" data-testid="appraisal-error">
              <p className="text-gray-700 mb-6">
                Something went wrong while generating your estimate.
              </p>
              <Button
                onClick={reset}
                className="bg-[#E31837] hover:bg-[#c01530] text-white"
                data-testid="button-retry-appraisal"
              >
                Try again
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4" />
          <span>
            Your details stay private. Estimate only — final offer depends on inspection.
          </span>
        </div>
      </div>
    </main>
  );
}
