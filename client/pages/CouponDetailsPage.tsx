import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Power, PowerOff } from "lucide-react";
import {
  CouponStatusConfirmDialog,
  type CouponStatusDialogAction,
} from "@/components/coupons/CouponStatusConfirmDialog";
import { CouponStatusBadge } from "@/components/coupons/CouponStatusBadge";
import { DetailField } from "@/components/coupons/details/DetailField";
import { ParcelSizeDetailValue } from "@/components/coupons/details/ParcelSizeDetailValue";
import { FormSection } from "@/components/coupons/form/FormSection";
import { Button } from "@/components/ui/button";
import { useCoupons } from "@/context/CouponsContext";
import {
  canActivateCoupon,
  canDeactivateCoupon,
  findCouponByCode,
  formatAud,
  formatCouponType,
  formatUsage,
  formatUsageLimit,
  getAmountRemaining,
  getEffectiveCouponStatus,
  getUnavailableLabel,
  getUsageProgress,
  isAmountLimitReached,
  isUsageLimitReached,
} from "@/lib/couponDisplay";
import { couponEditPath, couponLogsPath } from "@/lib/couponPaths";
import {
  formatCustomerTypeRestriction,
  formatDeliverySpeedRestriction,
  formatMinimumOrderRestriction,
  formatRouteRestriction,
  formatStateRestriction,
} from "@/lib/couponRestrictions";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { COUPON_LOG_ACTION_LABELS, DISCOUNT_BASIS_LABELS } from "@/types/coupon";

const RECENT_LOG_COUNT = 4;

export function CouponDetailsPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { coupons } = useCoupons();
  const [statusAction, setStatusAction] = useState<CouponStatusDialogAction | null>(null);
  const coupon = findCouponByCode(coupons, code);

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
  const usageProgress = getUsageProgress(coupon);
  const remainingAmount = getAmountRemaining(coupon);
  const recentLogs = [...coupon.logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, RECENT_LOG_COUNT);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <Link
            to="/coupon-codes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Coupon Codes
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-all text-h1 tracking-wide">{coupon.code}</h1>
              <CouponStatusBadge status={status} className="shrink-0" />
            </div>
            <p className="mt-1 text-body-sm text-muted-foreground">Coupon Details</p>
            {unavailableLabel && (
              <p className="mt-1 text-body-sm text-muted-foreground">{unavailableLabel}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="gap-1.5" onClick={() => navigate(couponEditPath(coupon.code))}>
            <Pencil className="h-4 w-4" />
            Edit coupon
          </Button>
          <Button variant="outline" onClick={() => navigate(couponLogsPath(coupon.code))}>
            View logs
          </Button>
          {canDeactivateCoupon(coupon) && (
            <Button
              variant="outline"
              className="gap-1.5 text-red-700 hover:bg-red-50 hover:text-red-700"
              onClick={() => setStatusAction("deactivate")}
            >
              <PowerOff className="h-4 w-4" />
              Deactivate
            </Button>
          )}
          {canActivateCoupon(coupon) && (
            <Button variant="outline" className="gap-1.5" onClick={() => setStatusAction("activate")}>
              <Power className="h-4 w-4" />
              Activate
            </Button>
          )}
        </div>
      </div>

      <FormSection title="Coupon information">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField
            label="Coupon Code"
            value={<span className="break-all tracking-wide">{coupon.code}</span>}
            hint="Coupon codes cannot be changed after creation."
          />
          <DetailField label="Coupon Type" value={formatCouponType(coupon.type)} />
          <DetailField
            label="Customer name"
            value={coupon.customerName?.trim() || "All eligible customers"}
          />
          <DetailField label="Status" value={<CouponStatusBadge status={status} />} />
          <DetailField label="Created Date" value={formatDate(coupon.createdDate)} />
          <DetailField label="Start date" value={formatDate(coupon.startDate)} />
          <DetailField label="End date" value={formatDate(coupon.expiryDate)} />
        </dl>
      </FormSection>

      <FormSection title="Discount">
        {coupon.discount.type === "percentage_off" && (
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailField label="Discount" value={`${coupon.discount.value}%`} />
            <DetailField
              label="Discount basis"
              value={DISCOUNT_BASIS_LABELS[coupon.discountBasis ?? "total_value"]}
            />
            {coupon.discount.maxAmount !== undefined && (
              <DetailField label="Maximum discount" value={formatAud(coupon.discount.maxAmount)} />
            )}
          </dl>
        )}

        {coupon.discount.type === "fixed_amount_off" && (
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailField label="Discount" value={formatAud(coupon.discount.amount)} />
            <DetailField
              label="Discount basis"
              value={DISCOUNT_BASIS_LABELS[coupon.discountBasis ?? "total_value"]}
            />
          </dl>
        )}

        {coupon.discount.type === "volume_discount" && (
          <div className="space-y-5">
            <DetailField
              label="Discount basis"
              value={DISCOUNT_BASIS_LABELS[coupon.discountBasis ?? "total_value"]}
            />
            <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50/80 text-left text-caption-sm font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Shipments</th>
                  <th className="px-4 py-2.5 font-medium">Discount</th>
                </tr>
              </thead>
              <tbody>
                {coupon.discount.tiers.map((tier) => (
                  <tr key={`${tier.minQuantity}-${tier.percentage}`} className="border-t">
                    <td className="px-4 py-3 font-medium">{tier.minQuantity}+</td>
                    <td className="px-4 py-3">{tier.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </FormSection>

      <FormSection title="Restrictions">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="States" value={formatStateRestriction(coupon)} />
          <DetailField label="Delivery speed" value={formatDeliverySpeedRestriction(coupon)} />
          <DetailField label="Route" value={formatRouteRestriction(coupon)} />
          <DetailField label="Parcel size" value={<ParcelSizeDetailValue coupon={coupon} />} />
          <DetailField label="Customer type" value={formatCustomerTypeRestriction(coupon)} />
          <DetailField label="Minimum order value" value={formatMinimumOrderRestriction(coupon)} />
        </dl>
      </FormSection>

      <FormSection title="Usage & limits">
        <div className="space-y-5">
          <div>
            <p className="text-caption-sm font-medium text-muted-foreground">Successful uses</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">
              {formatUsage(coupon)}
              {isUsageLimitReached(coupon) ? " successful uses" : ""}
            </p>
            {coupon.usageLimit > 0 && (
              <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={cn(
                    "h-full rounded-full",
                    isUsageLimitReached(coupon) ? "bg-amber-500" : "bg-neutral-900",
                  )}
                  style={{ width: `${usageProgress}%` }}
                />
              </div>
            )}
          </div>

          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Total usage limit" value={formatUsageLimit(coupon)} />
            {coupon.amountLimit ? (
              <>
                <DetailField label="Amount limit" value={formatAud(coupon.amountLimit)} />
                <DetailField
                  label="Amount used"
                  value={
                    isAmountLimitReached(coupon)
                      ? `${formatAud(coupon.amountUsed ?? 0)} / ${formatAud(coupon.amountLimit)} used`
                      : formatAud(coupon.amountUsed ?? 0)
                  }
                />
                {remainingAmount !== null && (
                  <DetailField
                    label="Remaining amount"
                    value={
                      <span>
                        {formatAud(remainingAmount)}
                        {isAmountLimitReached(coupon) ? " · exhausted" : ""}
                      </span>
                    }
                  />
                )}
              </>
            ) : null}
          </dl>
        </div>
      </FormSection>

      <FormSection title="Coupon activity">
        {recentLogs.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {recentLogs.map((log) => (
                <article key={log.id} className="rounded-lg border px-3 py-3">
                  <p className="font-medium">{COUPON_LOG_ACTION_LABELS[log.action]}</p>
                  <p className="mt-1 text-caption-sm text-muted-foreground">
                    {formatDateTime(log.timestamp)}
                  </p>
                  <p className="mt-2 text-sm">{log.actor}</p>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="text-left text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="pb-2.5 font-medium">Activity</th>
                    <th className="pb-2.5 font-medium">Date/time</th>
                    <th className="pb-2.5 font-medium">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="border-t">
                      <td className="py-3 font-medium">{COUPON_LOG_ACTION_LABELS[log.action]}</td>
                      <td className="py-3 text-muted-foreground">{formatDateTime(log.timestamp)}</td>
                      <td className="py-3">{log.actor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(couponLogsPath(coupon.code))}
          >
            View all logs
          </Button>
        </div>
      </FormSection>

      <CouponStatusConfirmDialog
        coupon={statusAction ? coupon : null}
        action={statusAction}
        onClose={() => setStatusAction(null)}
      />
    </div>
  );
}
