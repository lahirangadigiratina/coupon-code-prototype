import { useEffect, useMemo, useState } from "react";
import { BookingTotals, CouponApplySection } from "@/components/booking/CouponApplySection";
import { ShipmentSummary } from "@/components/booking/ShipmentSummary";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useBookingCart } from "@/context/BookingCartContext";
import { useCoupons } from "@/context/CouponsContext";
import { calculateCouponDiscount, getCouponDiscountBase } from "@/lib/couponDiscount";
import { findCouponByCode, formatMoneyAud } from "@/lib/couponDisplay";
import { validateCouponForCart } from "@/lib/couponValidation";
import type { Coupon, VolumeDiscountTier } from "@/types/coupon";

interface AppliedState {
  coupon: Coupon;
  discountAmount: number;
  appliedTier: VolumeDiscountTier | null;
}

export function BookingReviewPage() {
  const { cart, removeCoupon } = useBookingCart();
  const { coupons } = useCoupons();
  const { showToast } = useToast();
  const [applied, setApplied] = useState<AppliedState | null>(null);

  useEffect(() => {
    if (!applied) return;
    const result = validateCouponForCart(applied.coupon.code, coupons, {
      ...cart,
      appliedCouponCode: applied.coupon.code,
    });
    if (!result.ok) {
      removeCoupon();
      setApplied(null);
    }
  }, [
    applied,
    cart.customerType,
    cart.deliverySpeed,
    cart.destinationState,
    cart.parcelWeightKg,
    cart.route,
    cart.subtotal,
    cart.deliveryFee,
    cart.taxAmount,
    cart.completedShipmentCount,
    coupons,
    removeCoupon,
  ]);

  const liveApplied = useMemo(() => {
    if (!applied) return null;
    const coupon = findCouponByCode(coupons, applied.coupon.code);
    if (!coupon) return applied;
    const { amount, tier } = calculateCouponDiscount(
      coupon,
      getCouponDiscountBase(coupon, cart),
      cart.completedShipmentCount,
    );
    return { coupon, discountAmount: amount, appliedTier: tier };
  }, [applied, cart, coupons]);

  const discountAmount = liveApplied?.discountAmount ?? 0;
  const total = Math.max(0, cart.subtotal - discountAmount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">Review shipment</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Check the shipment details and apply a coupon before confirmation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div className="space-y-6">
          <ShipmentSummary />
          <CouponApplySection
            applied={liveApplied}
            onApplied={setApplied}
            onRemoved={() => setApplied(null)}
          />
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <BookingTotals subtotal={cart.subtotal} discountAmount={discountAmount} />
          <Button
            className="w-full"
            onClick={() => {
              showToast({
                title: "Ready to continue booking",
                description: `Total due ${formatMoneyAud(total)}${
                  liveApplied ? ` after ${liveApplied.coupon.code}` : ""
                }.`,
              });
            }}
          >
            Continue booking
          </Button>
        </div>
      </div>
    </div>
  );
}
