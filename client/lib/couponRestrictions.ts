import {
  AUSTRALIAN_STATE_LABELS,
  CUSTOMER_TYPE_LABELS,
  DELIVERY_SPEED_LABELS,
  PARCEL_SIZE_LABELS,
  ROUTE_RESTRICTION_LABELS,
  type Coupon,
} from "@/types/coupon";
import { formatAud } from "@/lib/couponDisplay";
import {
  formatCustomParcelWeightRange,
  formatParcelSizeWeight,
  getPredefinedParcelSize,
  getRestrictedParcelSizes,
} from "@/lib/parcelSizes";

const UNRESTRICTED = "No restriction";

export function formatDeliverySpeedRestriction(coupon: Coupon): string {
  const speed = coupon.restrictions?.deliverySpeed;
  return speed ? DELIVERY_SPEED_LABELS[speed] : UNRESTRICTED;
}

export function formatRouteRestriction(coupon: Coupon): string {
  const route = coupon.restrictions?.route;
  if (!route) return UNRESTRICTED;
  if (route === "specific_region") {
    return coupon.restrictions?.specificRegion
      ? `Specific region · ${coupon.restrictions.specificRegion}`
      : ROUTE_RESTRICTION_LABELS[route];
  }
  return ROUTE_RESTRICTION_LABELS[route];
}

export function formatParcelSizeRestriction(coupon: Coupon): string {
  const sizes = getRestrictedParcelSizes(coupon.restrictions);
  if (sizes.length === 0) return UNRESTRICTED;

  return sizes
    .map((size) => {
      const preset = getPredefinedParcelSize(size);
      if (preset) {
        return `${preset.label} (${formatParcelSizeWeight(preset.maxWeightKg)})`;
      }

      const customRange = formatCustomParcelWeightRange(coupon.restrictions);
      return customRange ? `${PARCEL_SIZE_LABELS.custom} (${customRange})` : PARCEL_SIZE_LABELS.custom;
    })
    .join(", ");
}

export function formatCustomerTypeRestriction(coupon: Coupon): string {
  const customerType = coupon.restrictions?.customerType;
  return customerType ? CUSTOMER_TYPE_LABELS[customerType] : UNRESTRICTED;
}

export function formatMinimumOrderRestriction(coupon: Coupon): string {
  const value = coupon.restrictions?.minimumOrderValue;
  return value ? formatAud(value) : UNRESTRICTED;
}

export function formatStateRestriction(coupon: Coupon): string {
  const states = coupon.restrictions?.states;
  if (!states || states.length === 0) return "All states";
  return states.map((state) => AUSTRALIAN_STATE_LABELS[state]).join(", ");
}
