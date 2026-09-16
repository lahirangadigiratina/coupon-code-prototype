import type { AustralianState, CustomerType, DeliverySpeed, RouteRestriction } from "@/types/coupon";

export interface BookingCart {
  shipmentId: string;
  from: string;
  to: string;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  deliverySpeed: Exclude<DeliverySpeed, "any">;
  route: Exclude<RouteRestriction, "all" | "specific_region">;
  parcelWeightKg: number;
  customerType: Exclude<CustomerType, "all">;
  destinationState: AustralianState;
  completedShipmentCount: number;
  customerPhone: string;
  appliedCouponCode: string | null;
}

export const DEFAULT_BOOKING_CART: BookingCart = {
  shipmentId: "SHP-1842",
  from: "Sydney NSW",
  to: "Melbourne VIC",
  subtotal: 50,
  deliveryFee: 12,
  taxAmount: 3.45,
  deliverySpeed: "express",
  route: "domestic",
  parcelWeightKg: 2,
  customerType: "new",
  destinationState: "vic",
  completedShipmentCount: 12,
  customerPhone: "0412 345 678",
  appliedCouponCode: null,
};
