import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { composeCouponCode, normalizeCouponCodeInput, validateCouponCode } from "@/lib/couponCode";
import type { Coupon, CouponType } from "@/types/coupon";
import type { CouponFormErrors, CouponFormValues, VolumeTierInput } from "@/types/couponForm";
import { CouponCodeFields } from "./CouponCodeFields";
import { CouponDetailsFields } from "./CouponDetailsFields";
import { DiscountFields } from "./DiscountFields";
import { DiscountPreview } from "./DiscountPreview";
import { FormSection } from "./FormSection";
import { RestrictionsFields } from "./RestrictionsFields";
import { UsageValidityFields } from "./UsageValidityFields";

interface CouponFormProps {
  mode?: "create" | "edit" | "view";
  initialValues?: CouponFormValues;
  existingCoupon?: Coupon;
  existingCodes?: string[];
  currentCode?: string;
  submitLabel?: string;
  title: string;
  description: ReactNode;
  headerExtra?: ReactNode;
  backTo: string;
  backLabel: string;
  onSubmit?: (coupon: Coupon) => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function CouponForm({
  mode = "create",
  initialValues,
  existingCoupon,
  existingCodes = [],
  currentCode,
  submitLabel = "Save",
  title,
  description,
  headerExtra,
  backTo,
  backLabel,
  onSubmit,
  onCancel,
  onEdit,
}: CouponFormProps) {
  const readOnly = mode === "view";
  const [values, setValues] = useState<CouponFormValues>(
    () => initialValues ?? createDefaultCouponFormValues(),
  );
  const [errors, setErrors] = useState<CouponFormErrors>({});
  const [codeSectionVisible, setCodeSectionVisible] = useState(mode !== "create");
  const [codeValidated, setCodeValidated] = useState(mode !== "create");

  const updateValues = (patch: Partial<CouponFormValues>) => {
    if (readOnly) return;
    if (mode === "create" && "code" in patch) {
      setCodeValidated(false);
    }
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
    setValues((prev) =>
      applyCouponTypeChange(prev, type, { lockCode: mode === "edit" || !codeSectionVisible }),
    );
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
    if (mode === "create") setCodeValidated(false);
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
    if (readOnly || !onSubmit) return;
    const revealingCode = mode === "create" && !codeSectionVisible;
    const nextErrors = validateCouponForm(values, {
      existingCodes,
      currentCode,
      lockCode: mode === "edit" || revealingCode,
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

    if (revealingCode) {
      setValues((prev) => ({ ...prev, code: composeCouponCode("", prev.type) }));
      setCodeSectionVisible(true);
      setCodeValidated(false);
      window.requestAnimationFrame(() => {
        document.getElementById("coupon-code")?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById("coupon-code")?.focus();
      });
      return;
    }

    if (mode === "create" && !codeValidated) return;

    onSubmit(buildCouponFromForm(values, existingCoupon));
  };

  const handleValidateCode = () => {
    const codeError = validateCouponCode(values.code, values.type);
    if (codeError) {
      setErrors((prev) => ({ ...prev, code: codeError }));
      setCodeValidated(false);
      return;
    }

    const normalized = normalizeCouponCodeInput(values.code);
    const taken = existingCodes.some(
      (code) =>
        code.toUpperCase() === normalized &&
        code.toUpperCase() !== currentCode?.toUpperCase(),
    );
    if (taken) {
      setErrors((prev) => ({ ...prev, code: "This coupon code already exists." }));
      setCodeValidated(false);
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.code;
      return next;
    });
    setCodeValidated(true);
  };

  const canCreate =
    mode === "edit" ||
    (areMandatoryCouponFieldsFilled(values, { requireCode: codeSectionVisible }) &&
      (!codeSectionVisible || codeValidated));

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="sticky top-0 z-30 -mx-6 border-b bg-neutral-50 px-6 pb-4 pt-2">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-h1">{title}</h1>
          {headerExtra}
        </div>
        <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-6">
        <FormSection title="Type">
          <CouponDetailsFields
            values={values}
            errors={errors}
            codeLocked={mode === "edit"}
            readOnly={readOnly}
            onTypeChange={handleTypeChange}
            onChange={updateValues}
          />
          <DiscountFields
            values={values}
            errors={errors}
            readOnly={readOnly}
            onAddTier={handleAddTier}
            onRemoveTier={handleRemoveTier}
            onTierChange={handleTierChange}
          />
        </FormSection>

        <FormSection title="Limit">
          <RestrictionsFields
            values={values}
            errors={errors}
            readOnly={readOnly}
            onChange={updateValues}
          />
        </FormSection>

        <FormSection title="Usage">
          <UsageValidityFields
            values={values}
            errors={errors}
            readOnly={readOnly}
            onChange={updateValues}
            usageCount={existingCoupon?.usageCount}
            amountUsed={existingCoupon?.amountUsed}
          />
        </FormSection>

        {(mode === "edit" || codeSectionVisible) && (
          <FormSection title="Coupon code">
            <CouponCodeFields
              values={values}
              errors={errors}
              codeLocked={mode !== "create"}
              validated={codeValidated}
              onChange={updateValues}
              onValidate={handleValidateCode}
            />
          </FormSection>
        )}
      </div>

      <div className="sticky bottom-0 z-30 flex flex-col gap-3 border-t bg-neutral-50 py-4 sm:flex-row sm:items-center">
        <DiscountPreview values={values} />
        <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row sm:items-center sm:justify-end">
          {readOnly ? (
            <>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
                Back
              </Button>
              {onEdit ? (
                <Button type="button" className="w-full sm:w-auto" onClick={onEdit}>
                  Edit coupon
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={!canCreate}>
                {mode === "create" && codeSectionVisible ? "Save coupon" : submitLabel}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
