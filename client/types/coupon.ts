export const COUPON_TYPES = ["percentage_off", "fixed_amount_off", "volume_discount"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const COUPON_STATUSES = ["active", "inactive", "expired"] as const;
export type CouponStatus = (typeof COUPON_STATUSES)[number];

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  percentage_off: "Percentage off",
  fixed_amount_off: "Fixed amount off",
  volume_discount: "Volume discount",
};

export const DISCOUNT_BASES = ["before_tax", "total_value"] as const;
export type DiscountBasis = (typeof DISCOUNT_BASES)[number];

export const DISCOUNT_BASIS_LABELS: Record<DiscountBasis, string> = {
  before_tax: "Before tax",
  total_value: "After tax",
};

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  expired: "Expired",
};

export const COUPON_LOG_ACTIONS = [
  "created",
  "edited",
  "activated",
  "deactivated",
  "used",
  "expired",
  "usage_limit_reached",
  "amount_limit_reached",
] as const;
export type CouponLogAction = (typeof COUPON_LOG_ACTIONS)[number];

export const COUPON_LOG_ACTION_LABELS: Record<CouponLogAction, string> = {
  created: "Coupon created",
  edited: "Coupon edited",
  activated: "Coupon activated",
  deactivated: "Coupon deactivated",
  used: "Coupon used",
  expired: "Coupon expired",
  usage_limit_reached: "Usage limit reached",
  amount_limit_reached: "Amount limit reached",
};

export const COUPON_LOG_FILTERS = [
  "all",
  "created",
  "edited",
  "activated",
  "deactivated",
  "used",
  "expired",
  "limit_reached",
] as const;
export type CouponLogFilter = (typeof COUPON_LOG_FILTERS)[number];

export const COUPON_LOG_FILTER_LABELS: Record<CouponLogFilter, string> = {
  all: "All",
  created: "Created",
  edited: "Edited",
  activated: "Activated",
  deactivated: "Deactivated",
  used: "Used",
  expired: "Expired",
  limit_reached: "Limit reached",
};

export interface CouponLog {
  id: string;
  action: CouponLogAction;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface VolumeDiscountTier {
  minQuantity: number;
  percentage: number;
}

export type CouponDiscount =
  | { type: "percentage_off"; value: number; maxAmount?: number; currency?: "AUD" }
  | { type: "fixed_amount_off"; amount: number; currency: "AUD" }
  | { type: "volume_discount"; tiers: VolumeDiscountTier[] };

export const DELIVERY_SPEEDS = ["any", "economy", "express"] as const;
export type DeliverySpeed = (typeof DELIVERY_SPEEDS)[number];

export const ROUTE_RESTRICTIONS = ["all", "domestic", "international", "specific_region"] as const;
export type RouteRestriction = (typeof ROUTE_RESTRICTIONS)[number];

export const ROUTE_FORM_OPTIONS = ["all", "domestic", "specific_region"] as const;

export const PARCEL_SIZE_RESTRICTIONS = [
  "any",
  "pouch",
  "satchel",
  "shoebox",
  "carry_on",
  "large_box",
  "suitcase",
  "custom",
] as const;
export type ParcelSizeRestriction = (typeof PARCEL_SIZE_RESTRICTIONS)[number];
export const PARCEL_SIZE_SELECTABLE = [
  "pouch",
  "satchel",
  "shoebox",
  "carry_on",
  "large_box",
  "suitcase",
  "custom",
] as const;
export type SelectableParcelSize = (typeof PARCEL_SIZE_SELECTABLE)[number];
export type PredefinedParcelSize = Exclude<ParcelSizeRestriction, "any" | "custom">;

export const CUSTOMER_TYPES = ["all", "new", "vip", "business"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const DELIVERY_SPEED_LABELS: Record<DeliverySpeed, string> = {
  any: "Any",
  economy: "Economy",
  express: "Express",
};

export const ROUTE_RESTRICTION_LABELS: Record<RouteRestriction, string> = {
  all: "All routes",
  domestic: "Domestic",
  international: "International",
  specific_region: "Specific region",
};

export const PARCEL_SIZE_LABELS: Record<ParcelSizeRestriction, string> = {
  any: "Any size",
  pouch: "Pouch",
  satchel: "Satchel",
  shoebox: "Shoebox",
  carry_on: "Carry-on",
  large_box: "Large Box",
  suitcase: "Suitcase",
  custom: "Custom range",
};

export const PARCEL_SIZE_OPTION_LABELS: Record<ParcelSizeRestriction, string> = {
  any: "Any size",
  pouch: "Pouch — Up to 0.5 kg",
  satchel: "Satchel — Up to 1 kg",
  shoebox: "Shoebox — Up to 3 kg",
  carry_on: "Carry-on — Up to 10 kg",
  large_box: "Large Box — Up to 15 kg",
  suitcase: "Suitcase — Up to 20 kg",
  custom: "Custom Range — Custom weight",
};

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  all: "All customers",
  new: "New customers",
  vip: "VIP customers",
  business: "Business accounts",
};

export const AUSTRALIAN_STATES = [
  "nsw",
  "vic",
  "qld",
  "sa",
  "wa",
  "tas",
] as const;
export type AustralianState = (typeof AUSTRALIAN_STATES)[number];

export const AUSTRALIAN_STATE_LABELS: Record<AustralianState, string> = {
  nsw: "New South Wales",
  vic: "Victoria",
  qld: "Queensland",
  sa: "South Australia",
  wa: "Western Australia",
  tas: "Tasmania",
};

export interface CouponRestrictions {
  deliverySpeed?: Exclude<DeliverySpeed, "any">;
  route?: Exclude<RouteRestriction, "all">;
  specificRegion?: string;
  parcelSizes?: SelectableParcelSize[];
  minWeightKg?: number;
  maxWeightKg?: number;
  customerType?: Exclude<CustomerType, "all">;
  minimumOrderValue?: number | null;
  states?: AustralianState[];
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  discount: CouponDiscount;
  discountBasis?: DiscountBasis;
  startDate: string;
  expiryDate: string;
  usageCount: number;
  usageLimit: number;
  amountLimit?: number | null;
  amountUsed?: number;
  status: CouponStatus;
  createdDate: string;
  logs: CouponLog[];
  alias?: string | null;
  customerPhone?: string | null;
  restrictions?: CouponRestrictions;
}
