import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PARCEL_SIZE_OPTION_LABELS,
  PARCEL_SIZE_RESTRICTIONS,
  type ParcelSizeRestriction,
} from "@/types/coupon";
import type { CouponFormErrors, CouponFormValues } from "@/types/couponForm";
import { formatParcelSizeWeight, getPredefinedParcelSize } from "@/lib/parcelSizes";
import { CurrencyInput } from "./CurrencyInput";
import { FormField, fieldInputClass } from "./FormField";
import { StateMultiSelect } from "./StateMultiSelect";

interface RestrictionsFieldsProps {
  values: CouponFormValues;
  errors: CouponFormErrors;
  onChange: (patch: Partial<CouponFormValues>) => void;
}

export function RestrictionsFields({ values, errors, onChange }: RestrictionsFieldsProps) {
  const selectedParcelSize = getPredefinedParcelSize(values.parcelSize);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        id="states"
        label="States"
        hint="Leave empty to make this coupon available in all states."
      >
        <StateMultiSelect
          id="states"
          value={values.states}
          onChange={(states) => onChange({ states })}
        />
      </FormField>

      <FormField id="parcel-size" label="Parcel size">
        <Select
          value={values.parcelSize}
          onValueChange={(value) =>
            onChange({
              parcelSize: value as ParcelSizeRestriction,
              minWeightKg: "",
              maxWeightKg: "",
            })
          }
        >
          <SelectTrigger id="parcel-size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PARCEL_SIZE_RESTRICTIONS.map((size) => (
              <SelectItem key={size} value={size}>
                {PARCEL_SIZE_OPTION_LABELS[size]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedParcelSize && (
          <div className="rounded-lg border bg-neutral-50 px-3 py-2">
            <p className="text-sm font-medium">{selectedParcelSize.label}</p>
            <p className="mt-0.5 text-caption-sm text-muted-foreground">
              {formatParcelSizeWeight(selectedParcelSize.maxWeightKg)}
            </p>
            <p className="text-caption-sm text-muted-foreground">{selectedParcelSize.description}</p>
          </div>
        )}
      </FormField>

      {values.parcelSize === "custom" && (
        <>
          <FormField
            id="min-weight"
            label="Minimum weight"
            hint="Unit: kg"
            error={errors.minWeightKg}
          >
            <div className="relative">
              <Input
                id="min-weight"
                inputMode="decimal"
                value={values.minWeightKg}
                onChange={(event) => onChange({ minWeightKg: event.target.value })}
                placeholder="5"
                className={cn("pr-10", fieldInputClass(errors.minWeightKg))}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                kg
              </span>
            </div>
          </FormField>
          <FormField
            id="max-weight"
            label="Maximum weight"
            hint="Unit: kg"
            error={errors.maxWeightKg}
          >
            <div className="relative">
              <Input
                id="max-weight"
                inputMode="decimal"
                value={values.maxWeightKg}
                onChange={(event) => onChange({ maxWeightKg: event.target.value })}
                placeholder="12"
                className={cn("pr-10", fieldInputClass(errors.maxWeightKg))}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                kg
              </span>
            </div>
          </FormField>
        </>
      )}

      <FormField
        id="minimum-order-value"
        label="Minimum order value"
        error={errors.minimumOrderValue}
      >
        <CurrencyInput
          id="minimum-order-value"
          value={values.minimumOrderValue}
          onChange={(minimumOrderValue) => onChange({ minimumOrderValue })}
          placeholder="50"
          error={errors.minimumOrderValue}
        />
      </FormField>
    </div>
  );
}
