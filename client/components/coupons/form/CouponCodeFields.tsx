import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { composeCouponCode, getCodePrefixLabel, getCouponCodeSuffix } from "@/lib/couponCode";
import { cn } from "@/lib/utils";
import type { CouponFormErrors, CouponFormValues } from "@/types/couponForm";
import { CouponCodeInfoTooltip } from "./CouponCodeInfoTooltip";
import { FormField, fieldInputClass } from "./FormField";

interface CouponCodeFieldsProps {
  values: CouponFormValues;
  errors: CouponFormErrors;
  codeLocked?: boolean;
  validated?: boolean;
  onChange: (patch: Partial<CouponFormValues>) => void;
  onValidate?: () => void;
}

export function CouponCodeFields({
  values,
  errors,
  codeLocked,
  validated,
  onChange,
  onValidate,
}: CouponCodeFieldsProps) {
  const [copied, setCopied] = useState(false);
  const prefix = getCodePrefixLabel(values.code);
  const suffix = getCouponCodeSuffix(values.code, values.type);
  const showCopy = Boolean(codeLocked || validated);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(values.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <FormField
      id="coupon-code"
      label="Coupon code"
      required
      error={errors.code}
      className="w-full"
      hint={
        codeLocked
          ? "Coupon codes cannot be changed after creation."
          : validated
            ? "This coupon code is available. Copy it if you need to share it, then save the coupon."
            : "The prefix is generated from the coupon configurations. Enter 4–8 characters for the rest of the code, then validate."
      }
      labelAddon={<CouponCodeInfoTooltip />}
    >
      <div
        className={cn(
          "flex h-10 w-full overflow-hidden rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          fieldInputClass(errors.code),
          validated && !errors.code && "border-emerald-300",
          codeLocked && "bg-muted",
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
          placeholder="SAVE25"
          aria-invalid={Boolean(errors.code)}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-medium tracking-wide uppercase outline-none placeholder:text-muted-foreground",
            codeLocked && "cursor-not-allowed",
          )}
          onChange={(event) => {
            if (codeLocked) return;
            setCopied(false);
            onChange({ code: composeCouponCode(event.target.value, values.type) });
          }}
        />
        {!codeLocked && !validated && (
          <Button
            type="button"
            size="sm"
            className="m-1 h-8 shrink-0 px-2.5"
            disabled={!suffix.trim()}
            onClick={onValidate}
          >
            Validate
          </Button>
        )}
        {showCopy && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="m-1 h-8 shrink-0 gap-1.5 px-2.5"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
    </FormField>
  );
}
