import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
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
import { findCouponByCode, getEffectiveCouponStatus, getUnavailableLabel } from "@/lib/couponDisplay";
import { logMatchesFilter, logMatchesSearch, sortLogsNewestFirst } from "@/lib/couponLogs";
import { couponDetailsPath } from "@/lib/couponPaths";
import { formatDateTime } from "@/lib/utils";
import {
  COUPON_LOG_ACTION_LABELS,
  COUPON_LOG_FILTER_LABELS,
  COUPON_LOG_FILTERS,
  type CouponLogFilter,
} from "@/types/coupon";

export function CouponLogsPage() {
  const { code } = useParams();
  const { coupons } = useCoupons();
  const coupon = findCouponByCode(coupons, code);
  const [query, setQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState<CouponLogFilter>("all");

  const logs = useMemo(() => {
    if (!coupon) return [];
    return sortLogsNewestFirst(coupon.logs).filter(
      (log) => logMatchesFilter(log, activityFilter) && logMatchesSearch(log, query),
    );
  }, [activityFilter, coupon, query]);

  if (!coupon) {
    return (
      <div className="space-y-4">
        <Link
          to="/coupon-codes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Coupon Codes
        </Link>
        <h1 className="text-h1">Coupon not found</h1>
        <p className="text-body-sm text-muted-foreground">
          That coupon code does not exist in this prototype.
        </p>
      </div>
    );
  }

  const status = getEffectiveCouponStatus(coupon);
  const unavailableLabel = getUnavailableLabel(coupon);
  const filtersActive = query.trim().length > 0 || activityFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={couponDetailsPath(coupon.code)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Coupon Details
        </Link>
        <h1 className="mt-4 text-h1">Coupon Logs</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="break-all text-xl font-semibold tracking-wide">{coupon.code}</p>
          <CouponStatusBadge status={status} />
        </div>
        {unavailableLabel && (
          <p className="mt-2 text-body-sm text-muted-foreground">{unavailableLabel}</p>
        )}
      </div>

      <section className="overflow-hidden rounded-xl border bg-white shadow-soft-xs">
        <div className="flex flex-col gap-3 border-b bg-neutral-50/80 px-4 py-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Label htmlFor="log-search" className="sr-only">
              Search logs
            </Label>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="log-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search logs"
              className="h-10 bg-background pl-9"
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
            <div className="w-full sm:max-w-[12.5rem] lg:w-[12.5rem]">
              <Label htmlFor="activity-filter" className="mb-1.5 block text-xs text-muted-foreground">
                Activity type
              </Label>
              <Select
                value={activityFilter}
                onValueChange={(value) => setActivityFilter(value as CouponLogFilter)}
              >
                <SelectTrigger id="activity-filter" className="h-10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUPON_LOG_FILTERS.map((filter) => (
                    <SelectItem key={filter} value={filter}>
                      {COUPON_LOG_FILTER_LABELS[filter]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActivityFilter("all");
                }}
                className="self-start text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:mb-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-3 text-sm text-muted-foreground">
          {logs.length} log{logs.length !== 1 ? "s" : ""}
          {filtersActive ? " match your filters" : ""}
        </div>

        {logs.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium">No logs match your search</p>
            <p className="mt-1 text-caption-sm text-muted-foreground">
              Try a different activity type or search term.
            </p>
            {filtersActive && (
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setQuery("");
                  setActivityFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y md:hidden">
              {logs.map((log) => (
                <article key={log.id} className="space-y-2 px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{COUPON_LOG_ACTION_LABELS[log.action]}</p>
                    <p className="text-caption-sm text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Admin
                    </p>
                    <p className="mt-0.5 text-sm">{log.actor}</p>
                  </div>
                  <div>
                    <p className="text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Details
                    </p>
                    <p className="mt-0.5 break-words text-sm text-muted-foreground">{log.note ?? "—"}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-y bg-neutral-50/80 text-left text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Activity</th>
                    <th className="px-4 py-2.5 font-medium">Date & Time</th>
                    <th className="px-4 py-2.5 font-medium">Admin</th>
                    <th className="px-4 py-2.5 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium">{COUPON_LOG_ACTION_LABELS[log.action]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDateTime(log.timestamp)}</td>
                      <td className="px-4 py-3">{log.actor}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
