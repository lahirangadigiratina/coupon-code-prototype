import { formatDate, parseDateOnly } from "@/lib/utils";
import type { Coupon, CouponDiscount, CouponStatus, CouponType } from "@/types/coupon";
import { COUPON_TYPE_LABELS } from "@/types/coupon";

export function isCouponExpired(expiryDate: string, now = new Date()): boolean {
  const expiry = parseDateOnly(expiryDate);
  if (!expiry) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return expiry < today;
}

export function isCouponNotYetValid(startDate: string, now = new Date()): boolean {
  const start = parseDateOnly(startDate);
  if (!start) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start > today;
}

export function formatCouponDateRange(coupon: Coupon): string {
  return `${formatDate(coupon.startDate)} – ${formatDate(coupon.expiryDate)}`;
}

export function getEffectiveCouponStatus(coupon: Coupon): CouponStatus {
  if (isCouponExpired(coupon.expiryDate)) return "expired";
  if (isUsageLimitReached(coupon) || isAmountLimitReached(coupon)) return "exhausted";
  if (isCouponNotYetValid(coupon.startDate)) return "scheduled";
  return "active";
}

export function isUsageLimitReached(coupon: Coupon): boolean {
  return coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit;
}

export function isAmountLimitReached(coupon: Coupon): boolean {
  return Boolean(coupon.amountLimit && (coupon.amountUsed ?? 0) >= coupon.amountLimit);
}

export type CouponActivationBlock = "expired" | "usage_limit" | "amount_limit";

export function isCouponUnavailable(coupon: Coupon): boolean {
  return getEffectiveCouponStatus(coupon) !== "active";
}

export function getUnavailableLabel(coupon: Coupon): string | null {
  const status = getEffectiveCouponStatus(coupon);
  if (status === "expired") return "This coupon has expired.";
  if (status === "scheduled") return "This coupon is scheduled and is not valid yet.";
  if (status === "exhausted") {
    if (isUsageLimitReached(coupon)) return "Usage limit reached.";
    if (isAmountLimitReached(coupon)) return "Coupon discount limit reached.";
    return "This coupon is exhausted.";
  }
  return null;
}

export function formatAud(amount: number): string {
  return Number.isInteger(amount) ? `AUD $${amount}` : `AUD $${amount.toFixed(2)}`;
}

export function formatMoneyAud(amount: number): string {
  return `AUD $${Math.abs(amount).toFixed(2)}`;
}

export function formatDiscountMoney(amount: number): string {
  return `-AUD $${Math.abs(amount).toFixed(2)}`;
}

export function getAmountRemaining(coupon: Coupon): number | null {
  if (!coupon.amountLimit) return null;
  return Math.max(0, coupon.amountLimit - (coupon.amountUsed ?? 0));
}

export function formatAmountUsage(coupon: Coupon): string {
  if (!coupon.amountLimit) return "No amount limit";
  return `${formatAud(coupon.amountUsed ?? 0)} / ${formatAud(coupon.amountLimit)}`;
}

export function getAmountProgress(coupon: Coupon): number {
  if (!coupon.amountLimit) return 0;
  return Math.min(100, ((coupon.amountUsed ?? 0) / coupon.amountLimit) * 100);
}

export function formatCouponDiscount(discount: CouponDiscount): string {
  if (discount.type === "percentage_off") {
    return `${discount.value}%`;
  }

  if (discount.type === "fixed_amount_off") {
    const amount = Number.isInteger(discount.amount)
      ? `$${discount.amount}`
      : `$${discount.amount.toFixed(2)}`;
    return amount;
  }

  const percentages = discount.tiers.map((tier) => tier.percentage);
  if (percentages.length === 0) return "—";
  if (percentages.length === 1) return `${percentages[0]}%`;
  return `${percentages[0]}% → ${percentages[percentages.length - 1]}%`;
}

export function formatCouponType(type: CouponType): string {
  return COUPON_TYPE_LABELS[type];
}

export function formatUsage(coupon: Coupon): string {
  if (coupon.usageLimit <= 0) return `${coupon.usageCount} · Until runout`;
  return `${coupon.usageCount} / ${coupon.usageLimit}`;
}

export function formatUsageLimit(coupon: Coupon): string {
  if (coupon.usageLimit <= 0) return "Until runout";
  if (coupon.usageLimit === 1) return "Only once";
  return String(coupon.usageLimit);
}

export function getUsageProgress(coupon: Coupon): number {
  if (coupon.usageLimit <= 0) return 0;
  return Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100);
}

export function findCouponByCode(coupons: Coupon[], code: string | undefined): Coupon | undefined {
  if (!code) return undefined;
  const normalized = decodeURIComponent(code).trim().toUpperCase();
  return coupons.find((coupon) => coupon.code.toUpperCase() === normalized);
}

export function couponMatchesSearch(coupon: Coupon, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return (
    coupon.code.toLowerCase().includes(term) ||
    Boolean(coupon.alias?.toLowerCase().includes(term))
  );
}
