import type { Coupon, VolumeDiscountTier } from "@/types/coupon";
import type { BookingCart } from "@/types/booking";

export function getCouponDiscountBase(coupon: Coupon, cart: BookingCart): number {
  const basis = coupon.discountBasis ?? "total_value";
  if (basis === "before_tax") return Math.max(0, cart.subtotal - cart.taxAmount);
  return cart.subtotal;
}

export function getQualifyingVolumeTier(
  coupon: Coupon,
  completedShipmentCount: number,
): VolumeDiscountTier | null {
  if (coupon.discount.type !== "volume_discount") return null;

  return (
    [...coupon.discount.tiers]
      .filter((tier) => completedShipmentCount >= tier.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0] ?? null
  );
}

export function getNextVolumeTier(
  coupon: Coupon,
  completedShipmentCount: number,
): VolumeDiscountTier | null {
  if (coupon.discount.type !== "volume_discount") return null;

  return (
    [...coupon.discount.tiers]
      .filter((tier) => completedShipmentCount < tier.minQuantity)
      .sort((a, b) => a.minQuantity - b.minQuantity)[0] ?? null
  );
}

export function calculateCouponDiscount(
  coupon: Coupon,
  subtotal: number,
  completedShipmentCount: number,
): { amount: number; tier: VolumeDiscountTier | null } {
  if (subtotal <= 0) return { amount: 0, tier: null };

  if (coupon.discount.type === "fixed_amount_off") {
    return { amount: capDiscount(Math.min(coupon.discount.amount, subtotal), coupon, subtotal), tier: null };
  }

  if (coupon.discount.type === "volume_discount") {
    const tier = getQualifyingVolumeTier(coupon, completedShipmentCount);
    if (!tier) return { amount: 0, tier: null };
    return { amount: capDiscount((subtotal * tier.percentage) / 100, coupon, subtotal), tier };
  }

  const raw = (subtotal * coupon.discount.value) / 100;
  const capped =
    coupon.discount.maxAmount !== undefined ? Math.min(raw, coupon.discount.maxAmount) : raw;
  return { amount: capDiscount(capped, coupon, subtotal), tier: null };
}

function capDiscount(amount: number, coupon: Coupon, subtotal: number): number {
  const remaining = coupon.amountLimit
    ? Math.max(0, coupon.amountLimit - (coupon.amountUsed ?? 0))
    : amount;
  const perUserCap = coupon.maxDiscountPerUser ?? amount;
  return Math.min(amount, remaining, perUserCap, subtotal);
}

export function formatCouponOffer(coupon: Coupon, tier?: VolumeDiscountTier | null): string {
  if (coupon.discount.type === "fixed_amount_off") {
    return `AUD $${coupon.discount.amount} off`;
  }
  if (coupon.discount.type === "volume_discount") {
    return `${tier?.percentage ?? coupon.discount.tiers[0]?.percentage ?? 0}% off`;
  }
  return `${coupon.discount.value}% off`;
}
