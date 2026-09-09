import {
  PARCEL_SIZE_LABELS,
  type CouponRestrictions,
  type ParcelSizeRestriction,
  type PredefinedParcelSize,
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

export function getParcelWeightBounds(restrictions?: CouponRestrictions): {
  min?: number;
  max?: number;
} {
  const size = restrictions?.parcelSize;
  if (!size) return {};

  if (size === "custom") {
    return {
      min: restrictions.minWeightKg,
      max: restrictions.maxWeightKg,
    };
  }

  if (isPredefinedParcelSize(size)) {
    return {
      max: restrictions.maxWeightKg ?? PREDEFINED_PARCEL_SIZE_DETAILS[size].maxWeightKg,
    };
  }

  return {};
}
