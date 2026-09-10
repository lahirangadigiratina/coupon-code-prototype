import { formatParcelSizeRestriction } from "@/lib/couponRestrictions";
import type { Coupon } from "@/types/coupon";

export function ParcelSizeDetailValue({ coupon }: { coupon: Coupon }) {
  return formatParcelSizeRestriction(coupon);
}
