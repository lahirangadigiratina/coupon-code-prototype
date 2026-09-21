import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, Plus, Search, TicketPercent } from "lucide-react";
import { CouponRowActions } from "@/components/coupons/CouponRowActions";
import { CouponStatusBadge } from "@/components/coupons/CouponStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoupons } from "@/context/CouponsContext";
import {
  couponMatchesSearch,
  formatCouponDateRange,
  formatCouponDiscount,
  formatCouponType,
  formatUsage,
  getEffectiveCouponStatus,
} from "@/lib/couponDisplay";
import { couponDetailsPath } from "@/lib/couponPaths";
import { sanitizeIntegerInput } from "@/lib/numericInput";
import { cn, formatDate } from "@/lib/utils";
import {
  COUPON_STATUS_LABELS,
  COUPON_STATUSES,
  COUPON_TYPE_LABELS,
  COUPON_TYPES,
  DISCOUNT_BASIS_LABELS,
  type Coupon,
  type CouponStatus,
  type CouponType,
} from "@/types/coupon";

const ALL = "all";
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];
const TABLE_GRID =
  "grid grid-cols-[minmax(10rem,1.2fr)_minmax(8.5rem,1fr)_minmax(7rem,0.85fr)_minmax(8.5rem,1fr)_minmax(7rem,0.85fr)_minmax(8rem,1fr)_5.5rem] gap-x-6";

const pagerControlClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white p-0 text-sm font-medium text-neutral-800 shadow-none hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40";
const pagerActiveClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border-transparent bg-neutral-950 p-0 text-sm font-medium text-white shadow-none hover:bg-neutral-950";

function pageButtons(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 0) return [];
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);

  const items: Array<number | "ellipsis"> = [];
  const start = Math.max(1, current - 1);
  const end = Math.min(total, current + 1);

  if (start > 1) {
    items.push(1);
    if (start > 2) items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) items.push(page);

  if (end < total) {
    if (end < total - 1) items.push("ellipsis");
    items.push(total);
  }

  return items;
}

type TypeFilter = typeof ALL | CouponType;
type StatusFilter = typeof ALL | CouponStatus;

function CouponStatusCell({ coupon }: { coupon: Coupon }) {
  return (
    <div className="flex min-w-0 justify-center">
      <CouponStatusBadge status={getEffectiveCouponStatus(coupon)} />
    </div>
  );
}

function TableStack({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold leading-5 text-neutral-900">{title}</p>
      {subtitle ? (
        <p className="mt-0.5 text-[13px] font-normal leading-5 text-neutral-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

function CouponCodeCell({ code, subtitle }: { code: string; subtitle?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <TableStack title={code} subtitle={subtitle} />
      <button
        type="button"
        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        aria-label={copied ? "Coupon code copied" : `Copy ${code}`}
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function discountSubtitle(coupon: Coupon): string {
  const { discount } = coupon;
  if (discount.type === "percentage_off") {
    return discount.maxAmount ? `Max AUD $${discount.maxAmount}` : DISCOUNT_BASIS_LABELS[coupon.discountBasis ?? "total_value"];
  }
  if (discount.type === "fixed_amount_off") {
    return DISCOUNT_BASIS_LABELS[coupon.discountBasis ?? "total_value"];
  }
  return `${discount.tiers.length} tier${discount.tiers.length === 1 ? "" : "s"}`;
}

function usageSubtitle(coupon: Coupon): string {
  if (coupon.usageLimit <= 0) return "Until runout";
  const remaining = Math.max(0, coupon.usageLimit - coupon.usageCount);
  return remaining === 1 ? "1 left" : `${remaining} left`;
}

function CouponListCard({ coupon }: { coupon: Coupon }) {
  const navigate = useNavigate();
  return (
    <article
      className="cursor-pointer border-b bg-white px-4 py-4 last:border-b-0"
      onClick={() => navigate(couponDetailsPath(coupon.code))}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CouponCodeCell
            code={coupon.code}
            subtitle={coupon.alias?.trim() || undefined}
          />
          <p className="mt-1 text-sm text-foreground">
            {formatCouponType(coupon.type)}
            <span className="text-muted-foreground"> · </span>
            <span className="font-medium">{formatCouponDiscount(coupon.discount)}</span>
          </p>
        </div>
        <div
          className="flex shrink-0 items-start gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <CouponStatusBadge status={getEffectiveCouponStatus(coupon)} className="mt-1.5" />
          <CouponRowActions coupon={coupon} />
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <dt className="text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Validity
          </dt>
          <dd className="mt-1 text-sm">{formatCouponDateRange(coupon)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Usage
          </dt>
          <dd className="mt-1 text-sm">{formatUsage(coupon)}</dd>
        </div>
      </dl>
    </article>
  );
}

export function CouponCodesPage() {
  const { coupons } = useCoupons();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    return coupons.filter((coupon) => {
      if (coupon.type === "volume_discount") return false;
      if (!couponMatchesSearch(coupon, query)) return false;
      if (typeFilter !== ALL && coupon.type !== typeFilter) return false;
      if (statusFilter !== ALL && getEffectiveCouponStatus(coupon) !== statusFilter) return false;
      return true;
    });
  }, [coupons, query, typeFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);
  const rangeStart = filtered.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + pageSize, filtered.length);

  const filtersActive = query.trim().length > 0 || typeFilter !== ALL || statusFilter !== ALL;

  const goToPage = (next: number) => {
    setPage(Math.min(pageCount, Math.max(1, next)));
  };

  const clearFilters = () => {
    setQuery("");
    setTypeFilter(ALL);
    setStatusFilter(ALL);
    setPage(1);
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <TicketPercent className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">No coupon codes match your search</p>
      <p className="mt-1 text-caption-sm text-muted-foreground">
        Try a different coupon code, type, or status.
      </p>
      {filtersActive && (
        <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-h1">Coupon Codes</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Create and manage discount codes for shipment bookings.
          </p>
        </div>
        <Button className="w-full gap-1.5 sm:w-auto" asChild>
          <Link to="/coupon-codes/create">
            <Plus className="h-4 w-4" />
            Create coupon code
          </Link>
        </Button>
      </div>

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex shrink-0 flex-col gap-3 border-b border-neutral-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Label htmlFor="coupon-search" className="sr-only">
                Search coupon codes
              </Label>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="coupon-search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search coupon codes"
                className="h-10 bg-background pl-9"
              />
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center lg:flex lg:w-auto lg:flex-wrap">
              <div className="flex min-w-0 items-center gap-2 lg:w-[14rem]">
                <Label htmlFor="type-filter" className="shrink-0 text-xs text-muted-foreground">
                  Type
                </Label>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => {
                    setTypeFilter(value as TypeFilter);
                    setPage(1);
                  }}
                >
                  <SelectTrigger id="type-filter" className="h-10 bg-background">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All</SelectItem>
                    {COUPON_TYPES.filter((type) => type !== "volume_discount").map((type) => (
                      <SelectItem key={type} value={type}>
                        {COUPON_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex min-w-0 items-center gap-2 lg:w-[14rem]">
                <Label htmlFor="status-filter" className="shrink-0 text-xs text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as StatusFilter);
                    setPage(1);
                  }}
                >
                  <SelectTrigger id="status-filter" className="h-10 bg-background">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All</SelectItem>
                    {COUPON_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {COUPON_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="justify-self-start text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col font-[Inter,system-ui,sans-serif]">
          <div className="min-h-0 flex-1 overflow-auto lg:hidden">
            {filtered.length === 0
              ? emptyState
              : pageItems.map((coupon) => <CouponListCard key={coupon.id} coupon={coupon} />)}
          </div>

          <div className="hidden min-h-0 flex-1 flex-col lg:flex">
            <div
              className={cn(
                TABLE_GRID,
                "shrink-0 border-b border-neutral-100 bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-neutral-500",
              )}
            >
              <span>Coupon code</span>
              <span>Type</span>
              <span>Discount</span>
              <span>Validity</span>
              <span>Usage</span>
              <span className="text-center">Status</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="min-w-[960px] px-1">
                {filtered.length === 0
                  ? emptyState
                  : pageItems.map((coupon) => (
                      <div
                        key={coupon.id}
                        role="link"
                        tabIndex={0}
                        className={cn(
                          TABLE_GRID,
                          "cursor-pointer items-start border-b border-neutral-100 px-5 py-5 last:border-b-0 hover:bg-neutral-50",
                        )}
                        onClick={() => navigate(couponDetailsPath(coupon.code))}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate(couponDetailsPath(coupon.code));
                          }
                        }}
                      >
                        <CouponCodeCell
                          code={coupon.code}
                          subtitle={coupon.alias?.trim() || `Created ${formatDate(coupon.createdDate)}`}
                        />
                        <TableStack
                          title={formatCouponType(coupon.type)}
                        />
                        <TableStack
                          title={formatCouponDiscount(coupon.discount)}
                          subtitle={discountSubtitle(coupon)}
                        />
                        <TableStack
                          title={formatDate(coupon.startDate)}
                          subtitle={formatDate(coupon.expiryDate)}
                        />
                        <TableStack title={formatUsage(coupon)} subtitle={usageSubtitle(coupon)} />
                        <CouponStatusCell coupon={coupon} />
                        <div
                          className="flex justify-end pt-0.5"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <CouponRowActions coupon={coupon} />
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-5 py-3">
              <p className="text-[13px] text-neutral-500">
                Showing {rangeStart}–{rangeEnd} of {filtered.length}
              </p>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <label className="flex items-center gap-2 text-[13px] text-neutral-500">
                  Rows per page
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger
                      aria-label="Rows per page"
                      className="h-8 w-[4.25rem] border-neutral-200 bg-white px-2 shadow-none"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={pagerControlClass}
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(1)}
                    aria-label="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={pagerControlClass}
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageButtons(currentPage, pageCount).map((item, index) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className={pagerControlClass}>
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={item === currentPage ? pagerActiveClass : pagerControlClass}
                        aria-current={item === currentPage ? "page" : undefined}
                        onClick={() => goToPage(item)}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className={pagerControlClass}
                    disabled={currentPage >= pageCount}
                    onClick={() => goToPage(currentPage + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={pagerControlClass}
                    disabled={currentPage >= pageCount}
                    onClick={() => goToPage(pageCount)}
                    aria-label="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
                <label className="flex items-center gap-2 text-[13px] text-neutral-500">
                  Go to
                  <Input
                    inputMode="numeric"
                    aria-label="Go to page"
                    className="h-8 w-8 rounded-md border-neutral-200 bg-white px-0 text-center shadow-none"
                    defaultValue={currentPage}
                    key={currentPage}
                    onChange={(event) => {
                      event.target.value = sanitizeIntegerInput(event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      const next = Number((event.target as HTMLInputElement).value);
                      if (!Number.isFinite(next) || next < 1) return;
                      goToPage(Math.trunc(next));
                    }}
                  />
                </label>
              </div>
            </div>
          )}
          </div>
        </div>
      </section>
    </div>
  );
}
