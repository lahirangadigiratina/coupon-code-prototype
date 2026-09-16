import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingCart } from "@/context/BookingCartContext";
import type { AustralianState, CustomerType, DeliverySpeed, RouteRestriction } from "@/types/coupon";
import { AUSTRALIAN_STATE_LABELS, AUSTRALIAN_STATES } from "@/types/coupon";

export function ShipmentSummary() {
  const { cart, updateCart } = useBookingCart();

  return (
    <section className="rounded-xl border bg-white p-5 shadow-soft-xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Shipment
          </h2>
          <p className="mt-1 text-caption-sm text-muted-foreground">{cart.shipmentId}</p>
        </div>
        <p className="text-sm text-muted-foreground sm:text-right">
          {cart.from} → {cart.to}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="delivery-speed">Delivery speed</Label>
          <Select
            value={cart.deliverySpeed}
            onValueChange={(value) =>
              updateCart({ deliverySpeed: value as Exclude<DeliverySpeed, "any"> })
            }
          >
            <SelectTrigger id="delivery-speed">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="express">Express</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="route">Route</Label>
          <Select
            value={cart.route}
            onValueChange={(value) =>
              updateCart({ route: value as Exclude<RouteRestriction, "all" | "specific_region"> })
            }
          >
            <SelectTrigger id="route">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domestic">Domestic</SelectItem>
              <SelectItem value="international">International</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="destination-state">Destination state</Label>
          <Select
            value={cart.destinationState}
            onValueChange={(value) =>
              updateCart({ destinationState: value as AustralianState })
            }
          >
            <SelectTrigger id="destination-state">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUSTRALIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {AUSTRALIAN_STATE_LABELS[state]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customer-type">Customer type</Label>
          <Select
            value={cart.customerType}
            onValueChange={(value) =>
              updateCart({ customerType: value as Exclude<CustomerType, "all"> })
            }
          >
            <SelectTrigger id="customer-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New customers</SelectItem>
              <SelectItem value="vip">VIP customers</SelectItem>
              <SelectItem value="business">Business accounts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="parcel-weight">Parcel weight (kg)</Label>
          <Input
            id="parcel-weight"
            inputMode="decimal"
            value={String(cart.parcelWeightKg)}
            onChange={(event) =>
              updateCart({ parcelWeightKg: Number(event.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subtotal">Cart total (AUD)</Label>
          <Input
            id="subtotal"
            inputMode="decimal"
            value={String(cart.subtotal)}
            onChange={(event) => updateCart({ subtotal: Number(event.target.value) || 0 })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="delivery-fee">Delivery fee (AUD)</Label>
          <Input
            id="delivery-fee"
            inputMode="decimal"
            value={String(cart.deliveryFee)}
            onChange={(event) => updateCart({ deliveryFee: Number(event.target.value) || 0 })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tax-amount">Tax (AUD)</Label>
          <Input
            id="tax-amount"
            inputMode="decimal"
            value={String(cart.taxAmount)}
            onChange={(event) => updateCart({ taxAmount: Number(event.target.value) || 0 })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customer-phone">Customer phone</Label>
          <Input
            id="customer-phone"
            type="tel"
            inputMode="tel"
            value={cart.customerPhone}
            onChange={(event) => updateCart({ customerPhone: event.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="shipment-history">Completed shipments</Label>
          <Input
            id="shipment-history"
            inputMode="numeric"
            value={String(cart.completedShipmentCount)}
            onChange={(event) =>
              updateCart({ completedShipmentCount: Number(event.target.value) || 0 })
            }
          />
        </div>
      </div>
    </section>
  );
}
