import type {
  AustralianState,
  CouponType,
  CustomerType,
  DeliverySpeed,
  DiscountBasis,
  RouteRestriction,
  SelectableParcelSize,
} from "@/types/coupon";

export interface VolumeTierInput {
  id: string;
  minQuantity: string;
  percentage: string;
}

export interface CouponFormValues {
  code: string;
  alias: string;
  type: CouponType;
  discountBasis: DiscountBasis;
  percentageValue: string;
  percentageMaxAmount: string;
  fixedAmount: string;
  volumeTiers: VolumeTierInput[];
  deliverySpeed: DeliverySpeed;
  route: RouteRestriction;
  specificRegion: string;
  parcelSizes: SelectableParcelSize[];
  minWeightKg: string;
  maxWeightKg: string;
  customerType: CustomerType;
  minimumOrderValue: string;
  customerPhone: string;
  states: AustralianState[];
  startDate: string;
  expiryDate: string;
  usageLimit: string;
  usageLimitMode: "" | "only_once" | "until_runout" | "custom";
  amountLimit: string;
}

export interface VolumeTierErrors {
  minQuantity?: string;
  percentage?: string;
}

export interface CouponFormErrors {
  code?: string;
  type?: string;
  percentageValue?: string;
  percentageMaxAmount?: string;
  fixedAmount?: string;
  volumeTiers?: Record<string, VolumeTierErrors>;
  volumeTiersGeneral?: string;
  specificRegion?: string;
  minWeightKg?: string;
  maxWeightKg?: string;
  minimumOrderValue?: string;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: string;
  amountLimit?: string;
}

export interface CouponFormSubmitContext {
  existingCodes?: string[];
  currentCode?: string;
  lockCode?: boolean;
  minUsageLimit?: number;
  minAmountUsed?: number;
}
