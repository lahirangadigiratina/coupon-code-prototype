import { useState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookingCart } from "@/context/BookingCartContext";
import { useCoupons } from "@/context/CouponsContext";
import { formatCouponOffer, getNextVolumeTier } from "@/lib/couponDiscount";
import { formatDiscountMoney, formatMoneyAud } from "@/lib/couponDisplay";
import { validateCouponForCart } from "@/lib/couponValidation";
import { formatDate } from "@/lib/utils";
import type { Coupon, VolumeDiscountTier } from "@/types/coupon";

interface AppliedState {
  coupon: Coupon;
  discountAmount: number;
  appliedTier: VolumeDiscountTier | null;
}

interface CouponApplySectionProps {
  applied: AppliedState | null;
  onApplied: (value: AppliedState) => void;
  onRemoved: () => void;
}

export function CouponApplySection({ applied, onApplied, onRemoved }: CouponApplySectionProps) {
  const { coupons } = useCoupons();
  const { cart, applyCoupon, removeCoupon } = useBookingCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    const result = validateCouponForCart(code, coupons, cart);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    applyCoupon(result.coupon.code);
    onApplied({
      coupon: result.coupon,
      discountAmount: result.discountAmount,
      appliedTier: result.appliedTier,
    });
    setCode("");
    setError(null);
  };

  const handleRemove = () => {
    removeCoupon();
    onRemoved();
    setError(null);
  };

  const nextTier =
    applied?.coupon.discount.type === "volume_discount"
      ? getNextVolumeTier(applied.coupon, cart.completedShipmentCount)
      : null;

  return (
    <section className="rounded-xl border bg-white p-5 shadow-soft-xs">
      <div className="mb-4 flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Have a coupon code?
        </h2>
      </div>

      {applied && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-caption-sm font-medium text-emerald-800">Coupon applied</p>
              <p className="mt-1 break-all text-base font-semibold tracking-wide text-emerald-950">
                {applied.coupon.code}
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                {formatCouponOffer(applied.coupon, applied.appliedTier)}
              </p>
              {applied.coupon.discount.type === "volume_discount" && (
                <p className="mt-1 text-caption-sm text-emerald-800">
                  Based on your shipping volume
                  {nextTier
                    ? ` · ${nextTier.minQuantity - cart.completedShipmentCount} more shipment${
                        nextTier.minQuantity - cart.completedShipmentCount === 1 ? "" : "s"
                      } to unlock ${nextTier.percentage}% off`
                    : ""}
                </p>
              )}
              <p className="mt-2 text-caption-sm text-emerald-800">
                Valid {formatDate(applied.coupon.startDate)} – {formatDate(applied.coupon.expiryDate)}
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-950">
                Discount: {formatDiscountMoney(applied.discountAmount)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full shrink-0 sm:w-auto"
              onClick={handleRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="customer-coupon-code" className="sr-only">
          Enter coupon code
        </Label>
        <div className="flex gap-2">
              <Input
                id="customer-coupon-code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleApply();
                  }
                }}
                placeholder="Enter coupon code"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 uppercase"
              />
              <Button type="button" className="shrink-0" onClick={handleApply} disabled={!code.trim()}>
                Apply
              </Button>
            </div>
        {error ? (
          <p className="text-caption-sm text-destructive" role="alert">
            {error}
          </p>
        ) : (
          <p className="break-words text-caption-sm text-muted-foreground">
            Try PLS-WELC10, PLS-FLAT5, PLS-LOYAL, PLS-EXPIRED, PLS-LIMIT, PLS-OFF26, or PLS-ECONOMY.
          </p>
        )}
      </div>
    </section>
  );
}

export function BookingTotals({
  subtotal,
  discountAmount,
}: {
  subtotal: number;
  discountAmount: number;
}) {
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <section className="rounded-xl border bg-white p-5 shadow-soft-xs">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Order total
      </h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">{formatMoneyAud(subtotal)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-700">
            <dt>Discount</dt>
            <dd className="font-medium">{formatDiscountMoney(discountAmount)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatMoneyAud(total)}</dd>
        </div>
      </dl>
    </section>
  );
}
