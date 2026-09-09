import { formatParcelSizeRestriction } from "@/lib/couponRestrictions";
import { formatParcelSizeWeight, getPredefinedParcelSize } from "@/lib/parcelSizes";
import type { Coupon } from "@/types/coupon";

export function ParcelSizeDetailValue({ coupon }: { coupon: Coupon }) {
  const size = coupon.restrictions?.parcelSize;
  const preset = size ? getPredefinedParcelSize(size) : null;

  if (!preset) {
    return formatParcelSizeRestriction(coupon);
  }

  return (
    <span className="block">
      <span className="block">{preset.label}</span>
      <span className="mt-0.5 block text-caption-sm font-medium text-muted-foreground">
        {formatParcelSizeWeight(coupon.restrictions?.maxWeightKg ?? preset.maxWeightKg)}
      </span>
      <span className="block text-caption-sm font-medium text-muted-foreground">
        {preset.description}
      </span>
    </span>
  );
}
