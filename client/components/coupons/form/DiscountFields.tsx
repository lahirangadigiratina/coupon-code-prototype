import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getDiscountPreview } from "@/lib/couponForm";
import type { CouponFormErrors, CouponFormValues, VolumeTierInput } from "@/types/couponForm";
import { FormField, fieldInputClass } from "./FormField";

interface DiscountFieldsProps {
  values: CouponFormValues;
  errors: CouponFormErrors;
  onAddTier: () => void;
  onRemoveTier: (id: string) => void;
  onTierChange: (id: string, patch: Partial<Omit<VolumeTierInput, "id">>) => void;
}

export function DiscountFields({
  values,
  errors,
  onAddTier,
  onRemoveTier,
  onTierChange,
}: DiscountFieldsProps) {
  const preview = getDiscountPreview(values);

  return (
    <div className="space-y-5">
      {values.type === "volume_discount" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Volume tiers</p>
              <p className="mt-1 text-caption-sm text-muted-foreground">
                Discount is applied to the total cart cost once the shipment threshold is reached.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full gap-1.5 sm:w-auto" onClick={onAddTier}>
              <Plus className="h-3.5 w-3.5" />
              Add tier
            </Button>
          </div>

          {errors.volumeTiersGeneral && (
            <p className="text-caption-sm text-destructive">{errors.volumeTiersGeneral}</p>
          )}

          <div className="space-y-3 md:space-y-0 md:overflow-hidden md:rounded-lg md:border">
            <div className="hidden grid-cols-[1fr_1fr_2.75rem] gap-3 border-b bg-neutral-50/80 px-4 py-2.5 text-caption-sm font-medium text-muted-foreground md:grid">
              <span>Shipments</span>
              <span>Discount</span>
              <span className="sr-only">Remove</span>
            </div>
            {values.volumeTiers.map((tier, index) => {
              const tierError = errors.volumeTiers?.[tier.id];
              return (
                <div
                  key={tier.id}
                  className="grid grid-cols-1 items-start gap-3 rounded-lg border px-4 py-3 md:grid-cols-[1fr_1fr_2.75rem] md:rounded-none md:border-0 md:border-b md:last:border-b-0"
                >
                  <FormField
                    id={`${tier.id}-threshold`}
                    label="Shipment threshold"
                    error={tierError?.minQuantity}
                    className={cn(index > 0 && "md:[&>label]:sr-only")}
                  >
                    <div className="relative">
                      <Input
                        id={`${tier.id}-threshold`}
                        inputMode="numeric"
                        value={tier.minQuantity}
                        onChange={(event) => onTierChange(tier.id, { minQuantity: event.target.value })}
                        placeholder="10"
                        aria-invalid={Boolean(tierError?.minQuantity)}
                        className={cn("pr-8", fieldInputClass(tierError?.minQuantity))}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                        +
                      </span>
                    </div>
                  </FormField>
                  <FormField
                    id={`${tier.id}-percentage`}
                    label="Discount percentage"
                    error={tierError?.percentage}
                    className={cn(index > 0 && "md:[&>label]:sr-only")}
                  >
                    <div className="relative">
                      <Input
                        id={`${tier.id}-percentage`}
                        inputMode="decimal"
                        value={tier.percentage}
                        onChange={(event) => onTierChange(tier.id, { percentage: event.target.value })}
                        placeholder="5"
                        aria-invalid={Boolean(tierError?.percentage)}
                        className={cn("pr-9", fieldInputClass(tierError?.percentage))}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormField>
                  <div className={cn("flex justify-end", index === 0 && "md:pt-6")}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveTier(tier.id)}
                      disabled={values.volumeTiers.length <= 1}
                      aria-label={`Remove tier ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {preview && (
        <div className="rounded-lg border border-dashed bg-neutral-50 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{preview}</span>
          <span> given per user.</span>
        </div>
      )}
    </div>
  );
}
