import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISCOUNT_BASES, DISCOUNT_BASIS_LABELS, type DiscountBasis } from "@/types/coupon";
import type { CouponFormValues } from "@/types/couponForm";
import { FormField } from "./FormField";

interface ApplicabilityFieldsProps {
  values: CouponFormValues;
  onChange: (patch: Partial<CouponFormValues>) => void;
}

export function ApplicabilityFields({ values, onChange }: ApplicabilityFieldsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        id="discount-basis"
        label="Discount basis"
        required
        hint="Choose what the discount is calculated on."
      >
        <Select
          value={values.discountBasis}
          onValueChange={(next) => onChange({ discountBasis: next as DiscountBasis })}
        >
          <SelectTrigger id="discount-basis">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DISCOUNT_BASES.map((basis) => (
              <SelectItem key={basis} value={basis}>
                {DISCOUNT_BASIS_LABELS[basis]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}
