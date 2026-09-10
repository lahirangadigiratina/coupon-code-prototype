import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  applyCouponTypeChange,
  areMandatoryCouponFieldsFilled,
  buildCouponFromForm,
  createDefaultCouponFormValues,
  createEmptyVolumeTier,
  hasCouponFormErrors,
  validateCouponForm,
} from "@/lib/couponForm";
import { generateUniqueCouponCode, getCouponCodeSuffix } from "@/lib/couponCode";
import type { Coupon, CouponType } from "@/types/coupon";
import type { CouponFormErrors, CouponFormValues, VolumeTierInput } from "@/types/couponForm";
import { CouponDetailsFields } from "./CouponDetailsFields";
import { DiscountFields } from "./DiscountFields";
import { FormSection } from "./FormSection";
import { RestrictionsFields } from "./RestrictionsFields";
import { UsageValidityFields } from "./UsageValidityFields";

interface CouponFormProps {
  mode?: "create" | "edit";
  initialValues?: CouponFormValues;
  existingCoupon?: Coupon;
  existingCodes?: string[];
  currentCode?: string;
  submitLabel: string;
  onSubmit: (coupon: Coupon) => void;
  onCancel: () => void;
}

export function CouponForm({
  mode = "create",
  initialValues,
  existingCoupon,
  existingCodes = [],
  currentCode,
  submitLabel,
  onSubmit,
  onCancel,
}: CouponFormProps) {
  const [values, setValues] = useState<CouponFormValues>(() => {
    const defaults = initialValues ?? createDefaultCouponFormValues();
    if (mode === "create" && !getCouponCodeSuffix(defaults.code, defaults.type)) {
      return { ...defaults, code: generateUniqueCouponCode(defaults.type, existingCodes) };
    }
    return defaults;
  });
  const [errors, setErrors] = useState<CouponFormErrors>({});

  const updateValues = (patch: Partial<CouponFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof CouponFormValues)[]) {
        if (key === "volumeTiers") {
          delete next.volumeTiers;
          delete next.volumeTiersGeneral;
        } else {
          delete next[key as keyof CouponFormErrors];
        }
      }
      return next;
    });
  };

  const handleTypeChange = (type: CouponType) => {
    setValues((prev) => {
      const next = applyCouponTypeChange(prev, type, { lockCode: mode === "edit" });
      if (mode === "edit") return next;
      const taken = existingCodes.some((code) => code.toUpperCase() === next.code.toUpperCase());
      if (!taken) return next;
      return { ...next, code: generateUniqueCouponCode(type, existingCodes) };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.type;
      delete next.code;
      delete next.percentageValue;
      delete next.percentageMaxAmount;
      delete next.fixedAmount;
      delete next.volumeTiers;
      delete next.volumeTiersGeneral;
      return next;
    });
  };

  const handleAddTier = () => {
    updateValues({ volumeTiers: [...values.volumeTiers, createEmptyVolumeTier()] });
  };

  const handleRemoveTier = (id: string) => {
    if (values.volumeTiers.length <= 1) return;
    updateValues({ volumeTiers: values.volumeTiers.filter((tier) => tier.id !== id) });
  };

  const handleTierChange = (id: string, patch: Partial<Omit<VolumeTierInput, "id">>) => {
    updateValues({
      volumeTiers: values.volumeTiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)),
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateCouponForm(values, {
      existingCodes,
      currentCode,
      lockCode: mode === "edit",
      minUsageLimit: existingCoupon?.usageCount,
      minAmountUsed: existingCoupon?.amountUsed,
    });
    setErrors(nextErrors);
    if (hasCouponFormErrors(nextErrors)) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>("[aria-invalid='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    onSubmit(buildCouponFromForm(values, existingCoupon));
  };

  const canCreate = mode === "edit" || areMandatoryCouponFieldsFilled(values);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <FormSection title="Coupon details">
        <CouponDetailsFields
          values={values}
          errors={errors}
          codeLocked
          onTypeChange={handleTypeChange}
          onChange={updateValues}
        />
        <DiscountFields
          values={values}
          errors={errors}
          onAddTier={handleAddTier}
          onRemoveTier={handleRemoveTier}
          onTierChange={handleTierChange}
        />
      </FormSection>

      <FormSection
        title="Restrictions"
        description="Optional limits for where this coupon can be used."
      >
        <RestrictionsFields values={values} errors={errors} onChange={updateValues} />
      </FormSection>

      <FormSection title="Usage & validity">
        <UsageValidityFields
          values={values}
          errors={errors}
          onChange={updateValues}
          usageCount={existingCoupon?.usageCount}
          amountUsed={existingCoupon?.amountUsed}
        />
      </FormSection>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={!canCreate}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
