import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CouponFormErrors, CouponFormValues } from "@/types/couponForm";
import { ChoosePhoneNumberDialog } from "./ChoosePhoneNumberDialog";
import { CurrencyInput } from "./CurrencyInput";
import { FormField, fieldInputClass } from "./FormField";
import { ParcelSizeMultiSelect } from "./ParcelSizeMultiSelect";
import { PhoneChipInput } from "./PhoneChipInput";
import { StateMultiSelect } from "./StateMultiSelect";

interface RestrictionsFieldsProps {
  values: CouponFormValues;
  errors: CouponFormErrors;
  onChange: (patch: Partial<CouponFormValues>) => void;
}

export function RestrictionsFields({ values, errors, onChange }: RestrictionsFieldsProps) {
  const [phonePickerOpen, setPhonePickerOpen] = useState(false);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        id="parcel-size"
        label="Parcel size"
        hint="Leave empty to make this coupon available for any parcel size."
      >
        <ParcelSizeMultiSelect
          id="parcel-size"
          value={values.parcelSizes}
          onChange={(parcelSizes) =>
            onChange({
              parcelSizes,
              ...(parcelSizes.includes("custom") ? {} : { minWeightKg: "", maxWeightKg: "" }),
            })
          }
        />
      </FormField>

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

      {values.parcelSizes.includes("custom") && (
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
        id="states"
        label="States"
        hint="All states makes this coupon available nationwide."
      >
        <StateMultiSelect
          id="states"
          value={values.states}
          onChange={(states) => onChange({ states })}
        />
      </FormField>

      <FormField
        id="customer-phone"
        label="Phone number"
        hint="Leave blank for all eligible customers."
        hintAction={
          <button
            type="button"
            className="shrink-0 text-caption-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={() => setPhonePickerOpen(true)}
          >
            Choose phone number
          </button>
        }
      >
        <PhoneChipInput
          id="customer-phone"
          value={values.customerPhones}
          onChange={(customerPhones) => onChange({ customerPhones })}
        />
      </FormField>
      <ChoosePhoneNumberDialog
        open={phonePickerOpen}
        selectedPhones={values.customerPhones}
        onClose={() => setPhonePickerOpen(false)}
        onAdd={(phones) => {
          const existing = new Set(values.customerPhones.map((phone) => phone.replace(/\s/g, "")));
          onChange({
            customerPhones: [
              ...values.customerPhones,
              ...phones.filter((phone) => !existing.has(phone.replace(/\s/g, ""))),
            ],
          });
        }}
      />
    </div>
  );
}
