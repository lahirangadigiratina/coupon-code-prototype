import {
  PARCEL_SIZE_LABELS,
  type CouponRestrictions,
  type ParcelSizeRestriction,
  type PredefinedParcelSize,
  type SelectableParcelSize,
} from "@/types/coupon";

export const PREDEFINED_PARCEL_SIZES = [
  "pouch",
  "satchel",
  "shoebox",
  "carry_on",
  "large_box",
  "suitcase",
] as const satisfies readonly PredefinedParcelSize[];

export const PREDEFINED_PARCEL_SIZE_DETAILS: Record<
  PredefinedParcelSize,
  { maxWeightKg: number; description: string }
> = {
  pouch: { maxWeightKg: 0.5, description: "Soft envelope" },
  satchel: { maxWeightKg: 1, description: "Padded bag" },
  shoebox: { maxWeightKg: 3, description: "Small box" },
  carry_on: { maxWeightKg: 10, description: "Medium box" },
  large_box: { maxWeightKg: 15, description: "Large box" },
  suitcase: { maxWeightKg: 20, description: "Extra large" },
};

export function isPredefinedParcelSize(size: ParcelSizeRestriction): size is PredefinedParcelSize {
  return size !== "any" && size !== "custom";
}

export function getPredefinedParcelSize(size: ParcelSizeRestriction) {
  if (!isPredefinedParcelSize(size)) return null;
  const details = PREDEFINED_PARCEL_SIZE_DETAILS[size];
  return {
    id: size,
    label: PARCEL_SIZE_LABELS[size],
    maxWeightKg: details.maxWeightKg,
    description: details.description,
  };
}

export function formatParcelSizeWeight(maxWeightKg: number): string {
  return `Up to ${maxWeightKg} kg`;
}

export function getRestrictedParcelSizes(restrictions?: CouponRestrictions): SelectableParcelSize[] {
  return restrictions?.parcelSizes ?? [];
}

export function parcelMatchesRestrictions(
  restrictions: CouponRestrictions | undefined,
  weightKg: number,
): boolean {
  const sizes = getRestrictedParcelSizes(restrictions);
  if (sizes.length === 0) return true;

  return sizes.some((size) => parcelSizeAllowsWeight(size, restrictions, weightKg));
}

function parcelSizeAllowsWeight(
  size: SelectableParcelSize,
  restrictions: CouponRestrictions | undefined,
  weightKg: number,
): boolean {
  if (size === "custom") {
    const min = restrictions?.minWeightKg;
    const max = restrictions?.maxWeightKg;
    if (min !== undefined && weightKg < min) return false;
    if (max !== undefined && weightKg > max) return false;
    return true;
  }

  return weightKg <= PREDEFINED_PARCEL_SIZE_DETAILS[size].maxWeightKg;
}

export function formatCustomParcelWeightRange(restrictions?: CouponRestrictions): string | null {
  const min = restrictions?.minWeightKg;
  const max = restrictions?.maxWeightKg;
  if (min !== undefined && max !== undefined) return `${min}–${max} kg`;
  if (min !== undefined) return `Min ${min} kg`;
  if (max !== undefined) return `Max ${max} kg`;
  return null;
}
