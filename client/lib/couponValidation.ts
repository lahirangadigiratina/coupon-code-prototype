import type { BookingCart } from "@/types/booking";
import type { Coupon, VolumeDiscountTier } from "@/types/coupon";
import { AUSTRALIAN_STATE_LABELS, CUSTOMER_TYPE_LABELS, DELIVERY_SPEED_LABELS } from "@/types/coupon";
import { calculateCouponDiscount, getCouponDiscountBase } from "@/lib/couponDiscount";
import { formatParcelSizeRestriction } from "@/lib/couponRestrictions";
import { parcelMatchesRestrictions } from "@/lib/parcelSizes";
import {
  findCouponByCode,
  formatAud,
  getEffectiveCouponStatus,
  isAmountLimitReached,
  isCouponExpired,
  isCouponNotYetValid,
  isUsageLimitReached,
} from "@/lib/couponDisplay";

export type CouponValidationErrorCode =
  | "invalid_code"
  | "expired"
  | "not_yet_valid"
  | "usage_limit"
  | "amount_limit"
  | "already_applied"
  | "restriction_delivery_speed"
  | "restriction_route"
  | "restriction_parcel_size"
  | "restriction_customer_type"
  | "restriction_minimum_order"
  | "restriction_state"
  | "volume_tier";

export type CouponValidationSuccess = {
  ok: true;
  coupon: Coupon;
  discountAmount: number;
  appliedTier: VolumeDiscountTier | null;
};

export type CouponValidationFailure = {
  ok: false;
  code: CouponValidationErrorCode;
  message: string;
};

export type CouponValidationResult = CouponValidationSuccess | CouponValidationFailure;

export const COUPON_VALIDATION_MESSAGES = {
  invalid_code: "This coupon code is not valid.",
  expired: "This coupon has expired.",
  not_yet_valid: "This coupon is not valid yet.",
  usage_limit: "This coupon has reached its usage limit.",
  amount_limit: "This coupon's discount limit has been reached.",
  already_applied: "Only one coupon can be applied to a shipment.",
} as const;

function fail(code: CouponValidationErrorCode, message: string): CouponValidationFailure {
  return { ok: false, code, message };
}

export function validateCouponForCart(
  code: string,
  coupons: Coupon[],
  cart: BookingCart,
): CouponValidationResult {
  const coupon = findCouponByCode(coupons, code);
  if (!coupon) return fail("invalid_code", COUPON_VALIDATION_MESSAGES.invalid_code);

  if (cart.appliedCouponCode && cart.appliedCouponCode.toUpperCase() !== coupon.code.toUpperCase()) {
    return fail("already_applied", COUPON_VALIDATION_MESSAGES.already_applied);
  }

  if (isCouponExpired(coupon.expiryDate) || getEffectiveCouponStatus(coupon) === "expired") {
    return fail("expired", COUPON_VALIDATION_MESSAGES.expired);
  }

  if (getEffectiveCouponStatus(coupon) === "scheduled" || isCouponNotYetValid(coupon.startDate)) {
    return fail("not_yet_valid", COUPON_VALIDATION_MESSAGES.not_yet_valid);
  }

  if (isUsageLimitReached(coupon)) {
    return fail("usage_limit", COUPON_VALIDATION_MESSAGES.usage_limit);
  }

  if (isAmountLimitReached(coupon)) {
    return fail("amount_limit", COUPON_VALIDATION_MESSAGES.amount_limit);
  }

  const restrictions = coupon.restrictions;

  if (restrictions?.deliverySpeed && restrictions.deliverySpeed !== cart.deliverySpeed) {
    return fail(
      "restriction_delivery_speed",
      `This coupon is only available for ${DELIVERY_SPEED_LABELS[restrictions.deliverySpeed]} delivery.`,
    );
  }

  if (restrictions?.route && restrictions.route !== cart.route) {
    return fail("restriction_route", "This coupon is not available for this route.");
  }

  if (!parcelMatchesRestrictions(restrictions, cart.parcelWeightKg)) {
    return fail(
      "restriction_parcel_size",
      `This coupon is only available for ${formatParcelSizeRestriction(coupon).toLowerCase()}.`,
    );
  }

  if (restrictions?.customerType && restrictions.customerType !== cart.customerType) {
    return fail(
      "restriction_customer_type",
      `This coupon is only available for ${
        restrictions.customerType === "business"
          ? "business accounts"
          : CUSTOMER_TYPE_LABELS[restrictions.customerType].toLowerCase()
      }.`,
    );
  }

  if (restrictions?.minimumOrderValue && cart.subtotal < restrictions.minimumOrderValue) {
    return fail(
      "restriction_minimum_order",
      `This coupon requires a minimum order value of ${formatAud(restrictions.minimumOrderValue)}.`,
    );
  }

  if (restrictions?.states && restrictions.states.length > 0) {
    if (!restrictions.states.includes(cart.destinationState)) {
      return fail(
        "restriction_state",
        `This coupon is only available for shipments to ${restrictions.states
          .map((state) => AUSTRALIAN_STATE_LABELS[state])
          .join(", ")}.`,
      );
    }
  }

  if (coupon.discount.type === "volume_discount") {
    const { amount, tier } = calculateCouponDiscount(
      coupon,
      getCouponDiscountBase(coupon, cart),
      cart.completedShipmentCount,
    );
    if (!tier) {
      const minimum = Math.min(...coupon.discount.tiers.map((item) => item.minQuantity));
      return fail(
        "volume_tier",
        `This coupon requires at least ${minimum} completed shipments.`,
      );
    }
    return { ok: true, coupon, discountAmount: amount, appliedTier: tier };
  }

  const { amount, tier } = calculateCouponDiscount(
    coupon,
    getCouponDiscountBase(coupon, cart),
    cart.completedShipmentCount,
  );

  return { ok: true, coupon, discountAmount: amount, appliedTier: tier };
}
