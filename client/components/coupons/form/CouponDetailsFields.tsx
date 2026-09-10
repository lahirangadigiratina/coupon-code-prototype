import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isCouponExpired } from "@/lib/couponDisplay";
import {
  COUPON_TYPE_LABELS,
  COUPON_TYPES,
  DISCOUNT_BASES,
  DISCOUNT_BASIS_LABELS,
  type CouponType,
  type DiscountBasis,
} from "@/types/coupon";
import type { CouponFormErrors, CouponFormValues } from "@/types/couponForm";
import { CouponCodeInfoTooltip } from "./CouponCodeInfoTooltip";
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

        {values.type === "volume_discount" && (
          <AliasField value={values.alias} onChange={(alias) => onChange({ alias })} />
        )}
      </div>

      {values.type !== "volume_discount" && (
        <div className="grid gap-5 md:grid-cols-2">
          <CouponCodeField values={values} errors={errors} />
          <AliasField value={values.alias} onChange={(alias) => onChange({ alias })} />
        </div>
      )}

      {values.type === "volume_discount" && (
        <div className="grid gap-5 md:grid-cols-2">
          <DiscountBasisField
            value={values.discountBasis}
            onChange={(discountBasis) => onChange({ discountBasis })}
          />
          <CouponCodeField values={values} errors={errors} />
        </div>
      )}

      {values.type !== "volume_discount" && (
        <div className="grid gap-5 md:grid-cols-2">
          <DiscountBasisField
            value={values.discountBasis}
            onChange={(discountBasis) => onChange({ discountBasis })}
          />
        </div>
      )}

      {codeLocked && isCouponExpired(values.expiryDate) && (
        <p className="text-body-sm text-muted-foreground">
          This coupon is Expired because the end date has passed. It cannot be activated until the
          end date is updated.
        </p>
      )}
    </div>
  );
}

function DiscountBasisField({
  value,
  onChange,
}: {
  value: DiscountBasis;
  onChange: (value: DiscountBasis) => void;
}) {
  return (
    <FormField
      id="discount-basis"
      label="Discount basis"
      required
      hint="Choose what the discount is calculated on."
    >
      <Select value={value} onValueChange={(next) => onChange(next as DiscountBasis)}>
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
  );
}

function CouponCodeField({
  values,
  errors,
}: {
  values: CouponFormValues;
  errors: CouponFormErrors;
}) {
  return (
    <FormField
      id="coupon-code"
      label="Coupon code"
      required
      error={errors.code}
      className="w-full"
      hint="Generated automatically. Coupon codes cannot be changed after creation."
      labelAddon={<CouponCodeInfoTooltip />}
    >
      <Input
        id="coupon-code"
        value={values.code}
        readOnly
        autoComplete="off"
        spellCheck={false}
        aria-invalid={Boolean(errors.code)}
        className="cursor-not-allowed bg-muted font-medium tracking-wide uppercase"
      />
    </FormField>
  );
}

function AliasField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField
      id="coupon-alias"
      label="Alias"
      hint="Optional internal name. Leave blank if not needed."
    >
      <Input
        id="coupon-alias"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter alias"
        autoComplete="off"
      />
    </FormField>
  );
}
