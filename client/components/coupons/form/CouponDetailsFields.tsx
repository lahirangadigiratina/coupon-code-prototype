import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isCouponExpired, isCouponNotYetValid } from "@/lib/couponDisplay";
import {
  COUPON_TYPE_LABELS,
  COUPON_TYPES,
  type CouponType,
} from "@/types/coupon";
import type { CouponFormErrors, CouponFormValues } from "@/types/couponForm";
import { CurrencyInput } from "./CurrencyInput";
import { FormField, fieldInputClass } from "./FormField";

interface CouponDetailsFieldsProps {
  values: CouponFormValues;
  errors: CouponFormErrors;
  codeLocked?: boolean;
  onTypeChange: (type: CouponType) => void;
  onChange: (patch: Partial<CouponFormValues>) => void;
}

export function CouponDetailsFields({
  values,
  errors,
  codeLocked,
  onTypeChange,
  onChange,
}: CouponDetailsFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="coupon-type" label="Coupon type" required error={errors.type}>
          <Select value={values.type} onValueChange={(value) => onTypeChange(value as CouponType)}>
            <SelectTrigger
              id="coupon-type"
              className={fieldInputClass(errors.type)}
              aria-invalid={Boolean(errors.type)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUPON_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {COUPON_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {values.type === "percentage_off" && (
          <FormField
            id="discount-percentage"
            label="Discount percentage"
            required
            error={errors.percentageValue}
          >
            <div className="relative">
              <Input
                id="discount-percentage"
                inputMode="decimal"
                value={values.percentageValue}
                onChange={(event) => onChange({ percentageValue: event.target.value })}
                placeholder="10"
                aria-invalid={Boolean(errors.percentageValue)}
                className={cn("pr-9", fieldInputClass(errors.percentageValue))}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </FormField>
        )}

        {values.type === "fixed_amount_off" && (
          <FormField
            id="discount-amount"
            label="Discount amount"
            required
            error={errors.fixedAmount}
          >
            <CurrencyInput
              id="discount-amount"
              value={values.fixedAmount}
              onChange={(fixedAmount) => onChange({ fixedAmount })}
              placeholder="5"
              error={errors.fixedAmount}
            />
          </FormField>
        )}
      </div>

      {codeLocked && isCouponExpired(values.expiryDate) && (
        <p className="text-body-sm text-muted-foreground">
          This coupon is Expired because the end date has passed. Update the end date to make it
          available again.
        </p>
      )}
      {codeLocked && !isCouponExpired(values.expiryDate) && isCouponNotYetValid(values.startDate) && (
        <p className="text-body-sm text-muted-foreground">
          This coupon is Scheduled because the start date is in the future.
        </p>
      )}
    </div>
  );
}
