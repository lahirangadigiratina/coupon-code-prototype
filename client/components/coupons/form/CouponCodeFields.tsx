import { composeCouponCode, getCodePrefixLabel, getCouponCodeSuffix } from "@/lib/couponCode";
import { cn } from "@/lib/utils";
import type { CouponFormErrors, CouponFormValues } from "@/types/couponForm";
import { CouponCodeInfoTooltip } from "./CouponCodeInfoTooltip";
import { FormField, fieldInputClass } from "./FormField";

interface CouponCodeFieldsProps {
  values: CouponFormValues;
  errors: CouponFormErrors;
  codeLocked?: boolean;
  onChange: (patch: Partial<CouponFormValues>) => void;
}

export function CouponCodeFields({
  values,
  errors,
  codeLocked,
  onChange,
}: CouponCodeFieldsProps) {
  const prefix = getCodePrefixLabel(values.code);
  const suffix = getCouponCodeSuffix(values.code, values.type);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        id="coupon-code"
        label="Coupon code"
        required
        error={errors.code}
        className="w-full"
        hint={
          codeLocked
            ? "Coupon codes cannot be changed after creation."
            : "The prefix is generated from the coupon configurations. Enter 4–8 characters for the rest of the code."
        }
        labelAddon={<CouponCodeInfoTooltip />}
      >
        <div
          className={cn(
            "flex h-10 w-full overflow-hidden rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            fieldInputClass(errors.code),
            codeLocked && "cursor-not-allowed bg-muted",
          )}
        >
          <span className="flex shrink-0 items-center bg-muted px-3 font-medium tracking-wide text-muted-foreground">
            {prefix}
          </span>
          <input
            id="coupon-code"
            value={suffix}
            readOnly={codeLocked}
            autoComplete="off"
            spellCheck={false}
            placeholder="WELC10"
            aria-invalid={Boolean(errors.code)}
            className={cn(
              "min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-medium tracking-wide uppercase outline-none placeholder:text-muted-foreground",
              codeLocked && "cursor-not-allowed",
            )}
            onChange={(event) => {
              if (codeLocked) return;
              onChange({ code: composeCouponCode(event.target.value, values.type) });
            }}
          />
        </div>
      </FormField>
    </div>
  );
}
