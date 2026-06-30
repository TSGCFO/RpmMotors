import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Appraisal } from "@shared/schema";
import { readResult } from "@shared/appraisal-result";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Tag } from "lucide-react";

interface ListResponse {
  data: Appraisal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  offerRequestCount7d: number;
}

interface CostBucket {
  count: number;
  totalCostCents: number;
  avgCostCents: number;
}
interface CostSummary {
  today: CostBucket;
  last7d: CostBucket;
  last30d: CostBucket;
  allTime: CostBucket;
}

// 1 cent = 1/100 USD. Render as e.g. "$2.37" or "—".
function formatCentsAsUsd(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function getWantsOffer(a: Appraisal): boolean {
  return readResult(a.result).wantsOffer === true || a.inquiryId != null;
}

function getConfidenceLabel(a: Appraisal): string | null {
  // `confidence` is not part of the canonical AppraisalResultData yet; access
  // it through an index lookup so we stay type-safe without `as any`.
  const r = readResult(a.result) as Record<string, unknown>;
  const c = r.confidence ?? r.confidenceLabel;
  return typeof c === "string" ? c : null;
}

function getStaffNotesPreview(a: Appraisal): string {
  const notes = readResult(a.result).staff?.staffNotes ?? "";
  if (!notes) return "—";
  return notes.length > 60 ? notes.slice(0, 60) + "…" : notes;
}

function getEstimateLabel(a: Appraisal): string {
  if (a.estimatedLow != null && a.estimatedHigh != null) {
    return `$${a.estimatedLow.toLocaleString()} – $${a.estimatedHigh.toLocaleString()}`;
  }
  if (a.estimatedMid != null) return `$${a.estimatedMid.toLocaleString()}`;
  return "—";
}

interface Props {
  basePath: "/employee/appraisals" | "/admin/appraisals";
}

export default function AppraisalListView({ basePath }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [offerOnly, setOfferOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "cost">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const queryString = new URLSearchParams();
  queryString.set("page", String(page));
  queryString.set("limit", "25");
  if (search) queryString.set("search", search);
  if (offerOnly) queryString.set("offerRequestsOnly", "true");
  if (dateFrom) queryString.set("dateFrom", dateFrom);
  if (dateTo) queryString.set("dateTo", dateTo);
  queryString.set("sortBy", sortBy);
  queryString.set("sortDir", sortDir);

  const url = `/api/admin/appraisals?${queryString.toString()}`;
  const { data: costSummary } = useQuery<CostSummary>({
    queryKey: ["/api/admin/appraisals/cost-summary"],
    queryFn: async () => {
      const res = await fetch("/api/admin/appraisals/cost-summary", { credentials: "include" });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
  });
  const { data, isLoading, isError, error } = useQuery<ListResponse>({
    queryKey: ["/api/admin/appraisals", page, search, offerOnly, dateFrom, dateTo, sortBy, sortDir],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Failed (${res.status})`);
      }
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appraisals</h1>
          <p className="text-gray-600 mt-1">
            Customer vehicle appraisal requests and AI valuations.
          </p>
        </div>
        {data && (
          <Badge variant="secondary" className="text-sm" data-testid="badge-offer-count">
            {data.offerRequestCount7d} offer request{data.offerRequestCount7d === 1 ? "" : "s"} in last 7 days
          </Badge>
        )}
      </div>

      {costSummary && (
        <Card data-testid="card-cost-summary">
          <CardHeader>
            <CardTitle className="text-base">AI cost (Anthropic)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {([
                { key: "today", label: "Today", bucket: costSummary.today },
                { key: "last7d", label: "Last 7 days", bucket: costSummary.last7d },
                { key: "last30d", label: "Last 30 days", bucket: costSummary.last30d },
                { key: "allTime", label: "All time", bucket: costSummary.allTime },
              ] as const).map(({ key, label, bucket }) => (
                <div
                  key={key}
                  className="rounded border bg-gray-50 p-3"
                  data-testid={`cost-bucket-${key}`}
                >
                  <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900" data-testid={`cost-bucket-${key}-total`}>
                    {formatCentsAsUsd(bucket.totalCostCents)}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    <span data-testid={`cost-bucket-${key}-count`}>{bucket.count}</span> appraisal{bucket.count === 1 ? "" : "s"}
                    {" · avg "}
                    <span data-testid={`cost-bucket-${key}-avg`}>{formatCentsAsUsd(bucket.avgCostCents)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  data-testid="input-search-appraisals"
                  placeholder="Name, email, make, or model"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button type="submit" variant="outline" size="icon" data-testid="button-search">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                data-testid="input-date-from"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                data-testid="input-date-to"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-4">
              <Switch
                id="offerOnly"
                checked={offerOnly}
                onCheckedChange={(c) => {
                  setOfferOnly(c);
                  setPage(1);
                }}
                data-testid="switch-offer-only"
              />
              <Label htmlFor="offerOnly" className="cursor-pointer">
                Offer requests only
              </Label>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : isError ? (
            <div className="p-6 text-red-600">
              {(error as Error)?.message || "Failed to load appraisals"}
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No appraisals found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>AI Estimate</TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 font-medium hover:text-gray-900"
                        data-testid="button-sort-cost"
                        onClick={() => {
                          if (sortBy === "cost") {
                            setSortDir((d) => (d === "desc" ? "asc" : "desc"));
                          } else {
                            setSortBy("cost");
                            setSortDir("desc");
                          }
                          setPage(1);
                        }}
                      >
                        Cost
                        {sortBy === "cost" ? (sortDir === "desc" ? " ↓" : " ↑") : " ↕"}
                      </button>
                    </TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Staff Notes</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((a) => {
                    const wantsOffer = getWantsOffer(a);
                    const conf = getConfidenceLabel(a);
                    const veh = [a.year, a.make, a.model, a.trim].filter(Boolean).join(" ");
                    return (
                      <TableRow key={a.id} data-testid={`row-appraisal-${a.id}`}>
                        <TableCell className="whitespace-nowrap text-sm text-gray-600">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{a.name}</div>
                          <div className="text-xs text-gray-500">{a.email}</div>
                        </TableCell>
                        <TableCell className="text-sm">{veh || "—"}</TableCell>
                        <TableCell className="text-sm">
                          {a.mileage != null ? `${a.mileage.toLocaleString()} km` : "—"}
                        </TableCell>
                        <TableCell className="text-sm">{a.conditionRating ?? "—"}</TableCell>
                        <TableCell className="text-sm font-medium">{getEstimateLabel(a)}</TableCell>
                        <TableCell className="text-sm text-gray-600" data-testid={`cell-cost-${a.id}`}>
                          {formatCentsAsUsd(a.totalCostCents)}
                        </TableCell>
                        <TableCell>
                          {wantsOffer ? (
                            <Badge className="bg-[#E31837] hover:bg-[#C31530]" data-testid={`badge-offer-${a.id}`}>
                              <Tag className="h-3 w-3 mr-1" /> Offer
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {conf ? <Badge variant="outline">{conf}</Badge> : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 max-w-[200px] truncate">
                          {getStaffNotesPreview(a)}
                        </TableCell>
                        <TableCell>
                          <Link href={`${basePath}/${a.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-view-${a.id}`}
                            >
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {data.page} of {data.totalPages} ({data.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              data-testid="button-prev-page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              data-testid="button-next-page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
