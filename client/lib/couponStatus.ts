import type { CouponActivationBlock } from "@/lib/couponDisplay";

export type CouponStatusChangeResult =
  | { ok: true; nextStatus: "active" | "inactive" }
  | { ok: false; reason: CouponActivationBlock | "not_allowed" };

export function getStatusChangeErrorMessage(
  reason: Extract<CouponStatusChangeResult, { ok: false }>["reason"],
): string {
  if (reason === "expired") {
    return "This coupon has expired and cannot be activated. Please update the end date first.";
  }
  if (reason === "usage_limit") {
    return "Usage limit reached. Increase the usage limit in Edit before activating this coupon.";
  }
  if (reason === "amount_limit") {
    return "Amount limit reached. Increase the amount limit in Edit before activating this coupon.";
  }
  return "This coupon status cannot be changed.";
}
