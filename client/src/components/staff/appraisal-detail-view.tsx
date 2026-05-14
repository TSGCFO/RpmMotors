import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Appraisal, AppraisalAuditLog, Inquiry } from "@shared/schema";
import { readResult, type AppraisalComp } from "@shared/appraisal-result";
import { apiRequest, queryClient as globalQc } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ArrowLeft, ExternalLink, Loader2, RefreshCw, Tag } from "lucide-react";

interface DetailResponse {
  appraisal: Appraisal;
  auditLog: AppraisalAuditLog[];
  inquiry: Inquiry | null;
}

type Comp = AppraisalComp & {
  askingPrice?: number;
  accidentSignalFromDescription?: string | boolean;
  descriptionExcerpt?: string;
  excludedFromAnchor?: boolean;
  majorAccident?: boolean;
};

function fmtMoney(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return "—";
  return `$${Number(n).toLocaleString()}`;
}

interface Props {
  id: number;
  basePath: "/employee/appraisals" | "/admin/appraisals";
}

export default function AppraisalDetailView({ id, basePath }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const detailKey = ["/api/admin/appraisals", id] as const;

  const { data, isLoading, isError, error } = useQuery<DetailResponse>({
    queryKey: detailKey,
    queryFn: async () => {
      const res = await fetch(`/api/admin/appraisals/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Failed (${res.status})`);
      }
      return res.json();
    },
  });

  const [staffNotes, setStaffNotes] = useState("");
  const [quotedPrice, setQuotedPrice] = useState<string>("");

  useEffect(() => {
    if (!data) return;
    const staff = readResult(data.appraisal.result).staff ?? {};
    setStaffNotes(staff.staffNotes ?? "");
    setQuotedPrice(staff.quotedPriceCad != null ? String(staff.quotedPriceCad) : "");
  }, [data]);

  const savePatch = useMutation({
    mutationFn: async () => {
      const body: { staffNotes: string | null; quotedPriceCad: number | null } = {
        staffNotes: staffNotes || null,
        quotedPriceCad: null,
      };
      if (quotedPrice.trim() !== "") {
        const num = Math.round(Number(quotedPrice));
        if (isNaN(num) || num < 0) throw new Error("Quoted price must be a non-negative number");
        body.quotedPriceCad = num;
      }
      const res = await apiRequest("PATCH", `/api/admin/appraisals/${id}`, body);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Appraisal updated." });
      qc.invalidateQueries({ queryKey: detailKey });
      globalQc.invalidateQueries({ queryKey: ["/api/admin/appraisals"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Please try again";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    },
  });

  const retryLead = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/appraisals/${id}/retry-lead`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lead created", description: "Inquiry record successfully created." });
      qc.invalidateQueries({ queryKey: detailKey });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Please try again";
      toast({ title: "Retry failed", description: msg, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Link href={basePath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="text-red-600">{(error as Error)?.message || "Not found"}</div>
      </div>
    );
  }

  const { appraisal: a, auditLog, inquiry } = data;
  const r = readResult(a.result);
  const wantsOffer = r.wantsOffer === true || a.inquiryId != null;
  const reasoning: string = r.reasoning ?? r.stage2?.reasoning ?? "";
  const factorTagsRaw: Array<string | { label?: string }> =
    r.factorTags ?? r.stage2?.factorTags ?? r.stage2?.priceFactors ?? [];
  const factorTags: string[] = factorTagsRaw.map((t) =>
    typeof t === "string" ? t : t?.label ?? JSON.stringify(t),
  );
  const breakdown =
    r.breakdown ?? r.stage2?.breakdown ?? r.stage2?.internalBreakdown ?? null;
  const comps: Comp[] = (r.comps ?? r.stage1?.comps ?? []) as Comp[];
  const modelUsed = r.modelUsed ?? r.meta?.modelUsed;
  const stage1Ms = r.stage1DurationMs ?? r.meta?.stage1DurationMs;
  const stage2Ms = r.stage2DurationMs ?? r.meta?.stage2DurationMs;
  const emailSentAt = r.emailSentAt ?? r.meta?.emailSentAt;
  const emailError = r.emailError ?? r.meta?.emailError;
  const leadInquiryError = r.leadInquiryError ?? r.meta?.leadInquiryError;
  const estimate = fmtMoney(a.estimatedMid ?? null);
  const estimateRange =
    a.estimatedLow != null && a.estimatedHigh != null
      ? `${fmtMoney(a.estimatedLow)} – ${fmtMoney(a.estimatedHigh)}`
      : null;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <Link href={basePath}>
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to list
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Appraisal #{a.id}</span>
          <Badge variant="outline">{a.status}</Badge>
        </div>
      </div>

      {leadInquiryError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5 text-red-600" />
            <div>
              <div className="font-semibold">Lead routing failed</div>
              <div className="text-sm">{leadInquiryError}</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => retryLead.mutate()}
            disabled={retryLead.isPending}
            data-testid="button-retry-lead"
          >
            {retryLead.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Retry
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Customer
            {wantsOffer && (
              <Badge className="bg-[#E31837] hover:bg-[#C31530]" data-testid="badge-wants-offer">
                <Tag className="h-3 w-3 mr-1" /> Wants firm offer
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{a.name}</dd></div>
            <div><dt className="text-gray-500">Email</dt><dd className="font-medium break-all">{a.email}</dd></div>
            <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{a.phone ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Postal code</dt><dd className="font-medium">{a.postalCode ?? "—"}</dd></div>
          </dl>
          {inquiry && (
            <div className="mt-4 text-sm flex items-center gap-2">
              <span className="text-gray-500">Linked inquiry:</span>
              <Link href={`/employee/inquiries?id=${inquiry.id}`}>
                <a
                  className="font-medium text-[#E31837] hover:underline inline-flex items-center gap-1"
                  data-testid="link-linked-inquiry"
                >
                  #{inquiry.id}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Link>
              <span className="text-gray-500">· {inquiry.status}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><dt className="text-gray-500">Year</dt><dd className="font-medium">{a.year}</dd></div>
            <div><dt className="text-gray-500">Make</dt><dd className="font-medium">{a.make}</dd></div>
            <div><dt className="text-gray-500">Model</dt><dd className="font-medium">{a.model}</dd></div>
            <div><dt className="text-gray-500">Trim</dt><dd className="font-medium">{a.trim ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Mileage</dt><dd className="font-medium">{a.mileage?.toLocaleString()} km</dd></div>
            <div><dt className="text-gray-500">VIN</dt><dd className="font-medium break-all">{a.vin ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Color</dt><dd className="font-medium">{a.exteriorColor ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Transmission</dt><dd className="font-medium">{a.transmission ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Drivetrain</dt><dd className="font-medium">{a.drivetrain ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Condition</dt><dd className="font-medium">{a.conditionRating ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Accidents</dt><dd className="font-medium">{a.accidentHistory ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Timeline</dt><dd className="font-medium">{a.sellingTimeline ?? "—"}</dd></div>
          </dl>
          {(a.conditionNotes || a.modifications) && (
            <div className="mt-4 space-y-2 text-sm">
              {a.conditionNotes && (
                <div><span className="text-gray-500">Condition notes: </span>{a.conditionNotes}</div>
              )}
              {a.modifications && (
                <div><span className="text-gray-500">Modifications: </span>{a.modifications}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-900" data-testid="text-estimate">
            {estimate}
          </div>
          {estimateRange && (
            <div className="text-sm text-gray-600 mt-1">Range: {estimateRange}</div>
          )}
          {reasoning && (
            <p
              className="mt-4 text-sm text-gray-700 whitespace-pre-wrap"
              data-testid="text-reasoning"
            >
              {reasoning}
            </p>
          )}
          {factorTags.length > 0 && (
            <div
              className="mt-4 flex flex-wrap gap-2"
              data-testid="factor-tags"
            >
              {factorTags.map((t, i) => (
                <Badge key={i} variant="secondary" data-testid={`factor-tag-${i}`}>
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {breakdown && (
        <Card data-testid="card-breakdown">
          <CardHeader>
            <CardTitle className="text-lg">Internal Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(
                  [
                    // Read the current Stage 2 `internalBreakdown` keys first,
                    // then fall back to the older field names so historical
                    // appraisal rows still render.
                    ["Anchor (CAD)", breakdown.anchorCad ?? breakdown.anchor],
                    ["Mileage adjustment", breakdown.mileageAdjustPct ?? breakdown.mileageAdj],
                    ["Condition multiplier", breakdown.conditionMult ?? breakdown.conditionPct],
                    ["Accident multiplier", breakdown.accidentMult ?? breakdown.accidentPct],
                    ["Owners multiplier", breakdown.ownersMult ?? breakdown.ownersPct],
                    ["Service records multiplier", breakdown.serviceRecordsMult ?? breakdown.serviceRecordsPct],
                    ["Seasonal multiplier", breakdown.seasonalMult ?? breakdown.seasonalPct],
                    ["Features bump (CAD)", breakdown.featureBumpCad ?? breakdown.featuresDollars ?? breakdown.featuresCad],
                    ["CPI nudge %", breakdown.cpiNudgePct ?? breakdown.cpiPct],
                    ["Pre-round (CAD)", breakdown.preRoundCad ?? breakdown.final],
                    ["Comps used", breakdown.compsUsedCount],
                  ] as Array<[string, unknown]>
                ).map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell className="text-gray-600">{label}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {value == null ? "—" : typeof value === "number" ? value.toLocaleString() : String(value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-comps">
        <CardHeader>
          <CardTitle className="text-lg">Comps</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {comps.length === 0 ? (
            <p className="text-sm text-gray-500">No comps captured.</p>
          ) : (
            <Table data-testid="table-comps">
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Asking</TableHead>
                  <TableHead>Accident signal</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comps.map((c, i) => {
                  const excluded = c.excludedFromAnchor || c.majorAccident;
                  return (
                    <TableRow key={i} className={excluded ? "bg-red-50" : ""} data-testid={`row-comp-${i}`}>
                      <TableCell>
                        <Badge variant="outline">{c.source ?? "—"}</Badge>
                        {excluded && (
                          <div className="text-xs text-red-700 mt-1">Excluded from anchor</div>
                        )}
                      </TableCell>
                      <TableCell>{c.year ?? "—"}</TableCell>
                      <TableCell>{c.mileage != null ? c.mileage.toLocaleString() : "—"}</TableCell>
                      <TableCell>{fmtMoney(c.askingPrice ?? null)}</TableCell>
                      <TableCell className="text-xs">
                        {c.accidentSignalFromDescription === false || c.accidentSignalFromDescription == null
                          ? "—"
                          : String(c.accidentSignalFromDescription)}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-xs text-gray-700 line-clamp-3">
                          {c.descriptionExcerpt ?? "—"}
                        </div>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline inline-flex items-center mt-1"
                          >
                            View listing <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Operational</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><dt className="text-gray-500">Model used</dt><dd className="font-medium">{modelUsed ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Stage 1 duration</dt><dd className="font-medium">{stage1Ms != null ? `${stage1Ms} ms` : "—"}</dd></div>
            <div><dt className="text-gray-500">Stage 2 duration</dt><dd className="font-medium">{stage2Ms != null ? `${stage2Ms} ms` : "—"}</dd></div>
            <div><dt className="text-gray-500">Email sent</dt><dd className="font-medium">{emailSentAt ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Email error</dt><dd className="font-medium text-red-700">{emailError ?? "—"}</dd></div>
            <div>
              <dt className="text-gray-500">Lead routing</dt>
              <dd className="font-medium">
                {a.inquiryId
                  ? <span className="text-green-700">Inquiry #{a.inquiryId}</span>
                  : leadInquiryError
                    ? <span className="text-red-700">Failed</span>
                    : <span className="text-gray-500">Not applicable</span>}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Staff Notes & Quoted Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quotedPrice">Quoted price (CAD)</Label>
            <Input
              id="quotedPrice"
              type="number"
              min={0}
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder="e.g. 24500"
              data-testid="input-quoted-price"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staffNotes">Staff notes</Label>
            <Textarea
              id="staffNotes"
              rows={5}
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="Internal notes about this appraisal"
              data-testid="textarea-staff-notes"
            />
          </div>
          <Button
            onClick={() => savePatch.mutate()}
            disabled={savePatch.isPending}
            className="bg-[#E31837] hover:bg-[#C31530]"
            data-testid="button-save-staff-fields"
          >
            {savePatch.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit log</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {auditLog.length === 0 ? (
            <p className="text-sm text-gray-500">No events recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-xs text-gray-600">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{entry.event}</TableCell>
                    <TableCell className="text-sm">{entry.actor ?? "system"}</TableCell>
                    <TableCell className="text-xs font-mono max-w-md truncate">
                      {entry.details ? JSON.stringify(entry.details) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
