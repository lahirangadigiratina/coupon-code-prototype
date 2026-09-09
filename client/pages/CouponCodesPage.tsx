import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, TicketPercent } from "lucide-react";
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
  getUsageProgress,
} from "@/lib/couponDisplay";
import { cn } from "@/lib/utils";
import {
  COUPON_STATUS_LABELS,
  COUPON_STATUSES,
  COUPON_TYPE_LABELS,
  COUPON_TYPES,
  type Coupon,
  type CouponStatus,
  type CouponType,
} from "@/types/coupon";

const ALL = "all";
const TABLE_GRID =
  "grid grid-cols-[minmax(9rem,1.15fr)_minmax(9rem,1.15fr)_minmax(6.5rem,0.85fr)_minmax(10rem,1.2fr)_minmax(7rem,0.9fr)_minmax(6.5rem,0.8fr)_3.5rem] gap-x-4 items-center";

type TypeFilter = typeof ALL | CouponType;
type StatusFilter = typeof ALL | CouponStatus;

function UsageMeter({ coupon }: { coupon: Coupon }) {
  const progress = getUsageProgress(coupon);
  const unlimited = coupon.usageLimit <= 0;
  const atLimit = !unlimited && coupon.usageCount >= coupon.usageLimit;

  return (
    <div className="min-w-0">
      <p className="text-sm tabular-nums">{formatUsage(coupon)}</p>
      {!unlimited && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={cn("h-full rounded-full", atLimit ? "bg-amber-500" : "bg-neutral-900")}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function CouponListCard({ coupon }: { coupon: Coupon }) {
  return (
    <article className="border-b bg-white px-4 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-all font-semibold tracking-wide">{coupon.code}</p>
          <p className="mt-1 text-sm text-foreground">
            {formatCouponType(coupon.type)}
            <span className="text-muted-foreground"> · </span>
            <span className="font-medium">{formatCouponDiscount(coupon.discount)}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <CouponStatusBadge status={getEffectiveCouponStatus(coupon)} />
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
          <dd className="mt-1">
            <UsageMeter coupon={coupon} />
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function CouponCodesPage() {
  const { coupons } = useCoupons();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL);

  const filtered = useMemo(() => {
    return coupons.filter((coupon) => {
      if (!couponMatchesSearch(coupon, query)) return false;
      if (typeFilter !== ALL && coupon.type !== typeFilter) return false;
      if (statusFilter !== ALL && getEffectiveCouponStatus(coupon) !== statusFilter) return false;
      return true;
    });
  }, [coupons, query, typeFilter, statusFilter]);

  const filtersActive = query.trim().length > 0 || typeFilter !== ALL || statusFilter !== ALL;

  const clearFilters = () => {
    setQuery("");
    setTypeFilter(ALL);
    setStatusFilter(ALL);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

      <section className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-white shadow-soft-xs">
          <div className="flex flex-col gap-3 border-b bg-neutral-50/80 px-4 py-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Label htmlFor="coupon-search" className="sr-only">
                Search coupon codes
              </Label>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="coupon-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search coupon codes"
                className="h-10 bg-background pl-9"
              />
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end lg:flex lg:w-auto lg:flex-wrap">
              <div className="min-w-0 lg:w-[11.5rem]">
                <Label htmlFor="type-filter" className="mb-1.5 block text-xs text-muted-foreground">
                  Type
                </Label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeFilter)}>
                  <SelectTrigger id="type-filter" className="h-10 bg-background">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All</SelectItem>
                    {COUPON_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {COUPON_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0 lg:w-[10.5rem]">
                <Label htmlFor="status-filter" className="mb-1.5 block text-xs text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
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
                  className="justify-self-start text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:mb-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} coupon code{filtered.length !== 1 ? "s" : ""}
              {filtersActive ? " match your filters" : ""}
            </p>
          </div>

          <div className="lg:hidden">
            {filtered.length === 0
              ? emptyState
              : filtered.map((coupon) => <CouponListCard key={coupon.id} coupon={coupon} />)}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <div className="min-w-[920px]">
              <div
                className={cn(
                  TABLE_GRID,
                  "border-y bg-neutral-50/80 px-4 py-3 text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground",
                )}
              >
                <span>Coupon Code</span>
                <span>Type</span>
                <span>Discount</span>
                <span>Validity</span>
                <span>Usage</span>
                <span>Status</span>
                <span className="text-center text-[10px]">Actions</span>
              </div>

              {filtered.length === 0
                ? emptyState
                : filtered.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={cn(
                        TABLE_GRID,
                        "border-b px-4 py-4 last:border-b-0 hover:bg-neutral-50/80",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold tracking-wide">{coupon.code}</p>
                      </div>
                      <p className="text-sm text-foreground">{formatCouponType(coupon.type)}</p>
                      <p className="text-sm font-medium">{formatCouponDiscount(coupon.discount)}</p>
                      <p className="text-sm">{formatCouponDateRange(coupon)}</p>
                      <UsageMeter coupon={coupon} />
                      <div>
                        <CouponStatusBadge status={getEffectiveCouponStatus(coupon)} />
                      </div>
                      <div className="flex justify-center">
                        <CouponRowActions coupon={coupon} />
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
