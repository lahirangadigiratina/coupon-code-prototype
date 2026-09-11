import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CouponFormErrors, CouponFormValues } from "@/types/couponForm";
import { CurrencyInput } from "./CurrencyInput";
import { DateRangeInput } from "./DateInput";
import { FormField, fieldInputClass } from "./FormField";

const FIXED_USAGE_OPTIONS = [
  { value: "only_once", label: "Only once" },
  { value: "until_runout", label: "Until runout" },
  { value: "custom", label: "Custom" },
] as const;

interface UsageValidityFieldsProps {
  values: CouponFormValues;
  errors: CouponFormErrors;
  onChange: (patch: Partial<CouponFormValues>) => void;
  usageCount?: number;
  amountUsed?: number;
}

export function UsageValidityFields({
  values,
  errors,
  onChange,
  usageCount,
  amountUsed,
}: UsageValidityFieldsProps) {
  const isFixedAmount = values.type === "fixed_amount_off";
  const showCustomLimit = !isFixedAmount || values.usageLimitMode === "custom";

  const usageHint = usageCount
    ? `Current successful uses: ${usageCount}. Usage limit cannot be lower than this.`
    : isFixedAmount && values.usageLimitMode === "only_once"
      ? "This coupon can be used one time."
      : isFixedAmount && values.usageLimitMode === "until_runout"
        ? "This coupon can be used until the end date."
        : "The coupon becomes unavailable after the successful usage limit is reached.";

  const handleUsageModeChange = (mode: CouponFormValues["usageLimitMode"]) => {
    if (mode === "only_once") {
      onChange({ usageLimitMode: mode, usageLimit: "1" });
      return;
    }
    if (mode === "until_runout") {
      onChange({ usageLimitMode: mode, usageLimit: "0" });
      return;
    }
    onChange({
      usageLimitMode: mode,
      usageLimit: values.usageLimit === "0" || values.usageLimit === "1" ? "" : values.usageLimit,
    });
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        id="usage-limit"
        label="Total usage limit"
        required
        hint={usageHint}
        error={errors.usageLimit}
      >
        {isFixedAmount ? (
          <div className="space-y-3">
            <Select
              value={values.usageLimitMode || undefined}
              onValueChange={(value) =>
                handleUsageModeChange(value as CouponFormValues["usageLimitMode"])
              }
            >
              <SelectTrigger id="usage-limit" aria-invalid={Boolean(errors.usageLimit)}>
                <SelectValue placeholder="Select usage limit" />
              </SelectTrigger>
              <SelectContent>
                {FIXED_USAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showCustomLimit && (
              <Input
                id="usage-limit-custom"
                inputMode="numeric"
                value={values.usageLimit === "0" ? "" : values.usageLimit}
                onChange={(event) => onChange({ usageLimit: event.target.value })}
                placeholder="500"
                aria-invalid={Boolean(errors.usageLimit)}
                className={fieldInputClass(errors.usageLimit)}
              />
            )}
          </div>
        ) : (
          <Input
            id="usage-limit"
            inputMode="numeric"
            value={values.usageLimit}
            onChange={(event) => onChange({ usageLimit: event.target.value })}
            placeholder="500"
            aria-invalid={Boolean(errors.usageLimit)}
            className={fieldInputClass(errors.usageLimit)}
          />
        )}
      </FormField>

      <FormField
        id="amount-limit"
        label="Amount exhausted"
        hint={
          amountUsed
            ? `Discount already given: AUD $${amountUsed}. The coupon becomes unavailable when this amount is exhausted.`
            : "Leave blank for no cap. The coupon becomes unavailable when this discount amount is exhausted."
        }
        error={errors.amountLimit}
      >
        <CurrencyInput
          id="amount-limit"
          value={values.amountLimit}
          onChange={(amountLimit) => onChange({ amountLimit })}
          placeholder="2000"
          error={errors.amountLimit}
        />
      </FormField>

      <FormField
        id="validity-dates"
        label="Validity dates"
        required
        error={errors.startDate || errors.expiryDate}
      >
        <DateRangeInput
          id="validity-dates"
          startDate={values.startDate}
          endDate={values.expiryDate}
          onChange={({ startDate, endDate }) => onChange({ startDate, expiryDate: endDate })}
          invalid={Boolean(errors.startDate || errors.expiryDate)}
        />
      </FormField>
    </div>
  );
}
