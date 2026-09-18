import {
  getCouponCodeSuffix,
  normalizeCouponCodeInput,
  syncCouponCodePrefix,
  validateCouponCode,
} from "@/lib/couponCode";
import { getRestrictedParcelSizes } from "@/lib/parcelSizes";
import { parseDateOnly } from "@/lib/utils";
import type { Coupon, CouponDiscount, CouponRestrictions, CouponType } from "@/types/coupon";
import type {
  CouponFormErrors,
  CouponFormSubmitContext,
  CouponFormValues,
  VolumeTierInput,
} from "@/types/couponForm";

function createTierId() {
  return `tier_${crypto.randomUUID()}`;
}

export function getCouponPhoneNumbers(coupon: Coupon): string[] {
  if (coupon.customerPhones?.length) {
    return coupon.customerPhones.map((phone) => phone.trim()).filter(Boolean);
  }
  const legacy = coupon.customerPhone?.trim();
  return legacy ? [legacy] : [];
}

export function createDefaultVolumeTiers(): VolumeTierInput[] {
  return [
    { id: createTierId(), minQuantity: "10", percentage: "5" },
    { id: createTierId(), minQuantity: "20", percentage: "10" },
  ];
}

export function createDefaultCouponFormValues(): CouponFormValues {
  return {
    code: "",
    alias: "",
    type: "percentage_off",
    discountBasis: "total_value",
    percentageValue: "",
    percentageMaxAmount: "",
    fixedAmount: "",
    volumeTiers: createDefaultVolumeTiers(),
    deliverySpeed: "any",
    route: "all",
    specificRegion: "",
    parcelSizes: [],
    minWeightKg: "",
    maxWeightKg: "",
    customerType: "all",
    minimumOrderValue: "",
    customerPhones: [],
    states: [],
    startDate: "",
    expiryDate: "",
    usageLimit: "1",
    usageLimitMode: "",
    amountLimit: "",
    maxDiscountPerUser: "",
    frequencyLimit: "",
    frequencyPeriod: "",
  };
}

export function createEmptyVolumeTier(): VolumeTierInput {
  return { id: createTierId(), minQuantity: "", percentage: "" };
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidExpiryDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return parseDateOnly(value) !== null;
}

export function hasCouponFormErrors(errors: CouponFormErrors): boolean {
  if (errors.volumeTiers && Object.keys(errors.volumeTiers).length > 0) return true;
  return Object.entries(errors).some(([key, value]) => key !== "volumeTiers" && Boolean(value));
}

export function areMandatoryCouponFieldsFilled(
  values: CouponFormValues,
  options: { requireCode?: boolean } = {},
): boolean {
  if (!values.type) return false;
  if (options.requireCode !== false && !getCouponCodeSuffix(values.code, values.type).trim()) {
    return false;
  }

  if (values.type === "percentage_off" && !values.percentageValue.trim()) return false;
  if (values.type === "fixed_amount_off" && !values.fixedAmount.trim()) return false;
  if (values.type === "volume_discount") {
    if (values.volumeTiers.length === 0) return false;
    const allTiersFilled = values.volumeTiers.every(
      (tier) => tier.minQuantity.trim() && tier.percentage.trim(),
    );
    if (!allTiersFilled) return false;
  }

  if (!values.startDate.trim() || !values.expiryDate.trim()) return false;

  if (values.type === "fixed_amount_off") {
    if (!values.usageLimitMode) return false;
    if (values.usageLimitMode === "custom" && !values.usageLimit.trim()) return false;
  } else   if (!values.usageLimit.trim()) {
    return false;
  }

  return true;
}

export function validateCouponForm(
  values: CouponFormValues,
  context: CouponFormSubmitContext = {},
): CouponFormErrors {
  const errors: CouponFormErrors = {};

  if (!context.lockCode) {
    const codeError = validateCouponCode(values.code, values.type);
    if (codeError) {
      errors.code = codeError;
    } else {
      const normalized = normalizeCouponCodeInput(values.code);
      const taken = (context.existingCodes ?? []).some(
        (code) =>
          code.toUpperCase() === normalized &&
          code.toUpperCase() !== context.currentCode?.toUpperCase(),
      );
      if (taken) {
        errors.code = "This coupon code already exists.";
      }
    }
  }

  if (!values.type) {
    errors.type = "Coupon type is required.";
  }

  if (values.type === "percentage_off") {
    const percentage = parseNumber(values.percentageValue);
    if (percentage === null || percentage <= 0 || percentage > 100) {
      errors.percentageValue = "Enter a discount percentage between 1 and 100.";
    }

    if (values.percentageMaxAmount.trim()) {
      const maxAmount = parseNumber(values.percentageMaxAmount);
      if (maxAmount === null || maxAmount <= 0) {
        errors.percentageMaxAmount = "Maximum discount must be greater than 0.";
      }
    }
  }

  if (values.type === "fixed_amount_off") {
    const amount = parseNumber(values.fixedAmount);
    if (amount === null || amount <= 0) {
      errors.fixedAmount = "Enter a discount amount greater than 0.";
    }
  }

  if (values.type === "volume_discount") {
    if (values.volumeTiers.length === 0) {
      errors.volumeTiersGeneral = "Add at least one volume discount tier.";
    }

    const tierErrors: NonNullable<CouponFormErrors["volumeTiers"]> = {};
    const thresholds: number[] = [];

    values.volumeTiers.forEach((tier) => {
      const fieldErrors: { minQuantity?: string; percentage?: string } = {};
      const threshold = parseNumber(tier.minQuantity);
      const percentage = parseNumber(tier.percentage);

      if (threshold === null || threshold <= 0 || !Number.isInteger(threshold)) {
        fieldErrors.minQuantity = "Enter a shipment threshold greater than 0.";
      } else if (thresholds.includes(threshold)) {
        fieldErrors.minQuantity = "Shipment thresholds must be unique.";
      } else {
        thresholds.push(threshold);
      }

      if (percentage === null || percentage <= 0 || percentage > 100) {
        fieldErrors.percentage = "Enter a discount percentage between 1 and 100.";
      }

      if (fieldErrors.minQuantity || fieldErrors.percentage) {
        tierErrors[tier.id] = fieldErrors;
      }
    });

    if (Object.keys(tierErrors).length > 0) {
      errors.volumeTiers = tierErrors;
    }
  }

  if (values.parcelSizes.includes("custom")) {
    const minWeight = parseNumber(values.minWeightKg);
    const maxWeight = parseNumber(values.maxWeightKg);

    if (values.minWeightKg.trim() && (minWeight === null || minWeight < 0)) {
      errors.minWeightKg = "Enter a valid minimum weight.";
    }
    if (values.maxWeightKg.trim() && (maxWeight === null || maxWeight < 0)) {
      errors.maxWeightKg = "Enter a valid maximum weight.";
    }
    if (
      minWeight !== null &&
      maxWeight !== null &&
      minWeight >= 0 &&
      maxWeight >= 0 &&
      minWeight > maxWeight
    ) {
      errors.maxWeightKg = "Maximum weight must be greater than or equal to minimum weight.";
    }
  }

  if (values.minimumOrderValue.trim()) {
    const minimumOrderValue = parseNumber(values.minimumOrderValue);
    if (minimumOrderValue === null || minimumOrderValue <= 0) {
      errors.minimumOrderValue = "Minimum order value must be greater than 0.";
    }
  }

  if (!values.startDate || !isValidExpiryDate(values.startDate)) {
    errors.startDate = "Please select a valid start date.";
  }

  if (!values.expiryDate || !isValidExpiryDate(values.expiryDate)) {
    errors.expiryDate = "Please select a valid end date.";
  } else if (
    values.startDate &&
    isValidExpiryDate(values.startDate) &&
    values.startDate > values.expiryDate
  ) {
    errors.expiryDate = "End date must be on or after the start date.";
  }

  if (values.type === "fixed_amount_off") {
    if (!values.usageLimitMode) {
      errors.usageLimit = "Select a usage limit.";
    } else if (values.usageLimitMode === "only_once") {
      if (context.minUsageLimit !== undefined && context.minUsageLimit > 1) {
        errors.usageLimit = "Usage limit cannot be lower than the number of successful uses.";
      }
    } else if (values.usageLimitMode === "custom") {
      const usageLimit = parseNumber(values.usageLimit);
      if (usageLimit === null || usageLimit <= 0 || !Number.isInteger(usageLimit)) {
        errors.usageLimit = "Usage limit must be greater than 0.";
      } else if (context.minUsageLimit !== undefined && usageLimit < context.minUsageLimit) {
        errors.usageLimit = "Usage limit cannot be lower than the number of successful uses.";
      }
    }
  } else {
    const usageLimit = parseNumber(values.usageLimit);
    if (usageLimit === null || usageLimit <= 0 || !Number.isInteger(usageLimit)) {
      errors.usageLimit = "Usage limit must be greater than 0.";
    } else if (context.minUsageLimit !== undefined && usageLimit < context.minUsageLimit) {
      errors.usageLimit = "Usage limit cannot be lower than the number of successful uses.";
    }
  }

  if (values.amountLimit.trim()) {
    const amountLimit = parseNumber(values.amountLimit);
    if (amountLimit === null || amountLimit <= 0) {
      errors.amountLimit = "Amount limit must be greater than 0.";
    } else if (context.minAmountUsed !== undefined && amountLimit < context.minAmountUsed) {
      errors.amountLimit = "Amount limit cannot be lower than the discount already given.";
    }
  }

  if (values.maxDiscountPerUser.trim()) {
    const maxDiscountPerUser = parseNumber(values.maxDiscountPerUser);
    if (maxDiscountPerUser === null || maxDiscountPerUser <= 0) {
      errors.maxDiscountPerUser = "Maximum discount value per user must be greater than 0.";
    }
  }

  if (values.frequencyLimit.trim() || values.frequencyPeriod) {
    const frequencyLimit = parseNumber(values.frequencyLimit);
    if (frequencyLimit === null || frequencyLimit <= 0 || !Number.isInteger(frequencyLimit)) {
      errors.frequencyLimit = "Enter how many times one customer can redeem this coupon in the period.";
    }
    if (!values.frequencyPeriod) {
      errors.frequencyPeriod = "Select a calendar period.";
    }
  }

  return errors;
}

function buildDiscount(values: CouponFormValues): CouponDiscount {
  if (values.type === "fixed_amount_off") {
    return {
      type: "fixed_amount_off",
      amount: Number(values.fixedAmount),
      currency: "AUD",
    };
  }

  if (values.type === "volume_discount") {
    return {
      type: "volume_discount",
      tiers: values.volumeTiers
        .map((tier) => ({
          minQuantity: Number(tier.minQuantity),
          percentage: Number(tier.percentage),
        }))
        .sort((a, b) => a.minQuantity - b.minQuantity),
    };
  }

  const maxAmount = parseNumber(values.percentageMaxAmount);
  return {
    type: "percentage_off",
    value: Number(values.percentageValue),
    ...(maxAmount && maxAmount > 0 ? { maxAmount, currency: "AUD" as const } : {}),
  };
}

function buildRestrictions(values: CouponFormValues): CouponRestrictions | undefined {
  const restrictions: CouponRestrictions = {};

  if (values.deliverySpeed !== "any") {
    restrictions.deliverySpeed = values.deliverySpeed;
  }

  if (values.route !== "all") {
    restrictions.route = values.route;
    if (values.route === "specific_region" && values.specificRegion.trim()) {
      restrictions.specificRegion = values.specificRegion.trim();
    }
  }

  if (values.parcelSizes.length > 0) {
    restrictions.parcelSizes = [...values.parcelSizes];
    if (values.parcelSizes.includes("custom")) {
      const minWeight = parseNumber(values.minWeightKg);
      const maxWeight = parseNumber(values.maxWeightKg);
      if (minWeight !== null) restrictions.minWeightKg = minWeight;
      if (maxWeight !== null) restrictions.maxWeightKg = maxWeight;
    }
  }

  if (values.customerType !== "all") {
    restrictions.customerType = values.customerType;
  }

  if (values.states.length > 0) {
    restrictions.states = [...values.states];
  }

  const minimumOrderValue = parseNumber(values.minimumOrderValue);
  if (minimumOrderValue !== null && minimumOrderValue > 0) {
    restrictions.minimumOrderValue = minimumOrderValue;
  }

  return Object.keys(restrictions).length > 0 ? restrictions : undefined;
}

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function buildCouponFromForm(values: CouponFormValues, existing?: Coupon): Coupon {
  const amountLimit = parseNumber(values.amountLimit);
  const maxDiscountPerUser = parseNumber(values.maxDiscountPerUser);
  const frequencyLimit = parseNumber(values.frequencyLimit);
  const editedLog = existing
    ? {
        id: `log_${crypto.randomUUID()}`,
        action: "edited" as const,
        timestamp: new Date().toISOString(),
        actor: "Admin",
        note: "Coupon updated",
      }
    : null;

  return {
    id: existing?.id ?? `cpn_${crypto.randomUUID()}`,
    code: existing?.code ?? normalizeCouponCodeInput(values.code),
    alias: values.alias.trim() || null,
    type: values.type,
    discount: buildDiscount(values),
    discountBasis: values.discountBasis,
    startDate: values.startDate,
    expiryDate: values.expiryDate,
    usageCount: existing?.usageCount ?? 0,
    usageLimit: resolveUsageLimit(values),
    amountLimit: amountLimit && amountLimit > 0 ? amountLimit : null,
    amountUsed: existing?.amountUsed ?? 0,
    maxDiscountPerUser: maxDiscountPerUser && maxDiscountPerUser > 0 ? maxDiscountPerUser : null,
    frequency:
      frequencyLimit && frequencyLimit > 0 && values.frequencyPeriod
        ? { limit: frequencyLimit, period: values.frequencyPeriod }
        : null,
    redemptions: existing?.redemptions ?? [],
    customerPhones: values.customerPhones.length > 0 ? values.customerPhones : undefined,
    status: "active",
    createdDate: existing?.createdDate ?? todayIsoDate(),
    logs: editedLog
      ? [editedLog, ...(existing?.logs ?? [])]
      : [
          {
            id: `log_${crypto.randomUUID()}`,
            action: "created",
            timestamp: new Date().toISOString(),
            actor: "Admin",
            note: "Coupon created",
          },
        ],
    restrictions: buildRestrictions(values),
  };
}

function resolveUsageLimit(values: CouponFormValues): number {
  if (values.type === "fixed_amount_off") {
    if (values.usageLimitMode === "only_once") return 1;
    if (values.usageLimitMode === "until_runout") return 0;
  }
  return Number(values.usageLimit);
}

function usageLimitModeFromCoupon(usageLimit: number): CouponFormValues["usageLimitMode"] {
  if (usageLimit <= 0) return "until_runout";
  if (usageLimit === 1) return "only_once";
  return "custom";
}

export function couponToFormValues(coupon: Coupon): CouponFormValues {
  const defaults = createDefaultCouponFormValues();

  return {
    ...defaults,
    code: coupon.code,
    alias: coupon.alias ?? "",
    type: coupon.type,
    discountBasis: coupon.discountBasis ?? "total_value",
    percentageValue: coupon.discount.type === "percentage_off" ? String(coupon.discount.value) : "",
    percentageMaxAmount:
      coupon.discount.type === "percentage_off" && coupon.discount.maxAmount
        ? String(coupon.discount.maxAmount)
        : "",
    fixedAmount: coupon.discount.type === "fixed_amount_off" ? String(coupon.discount.amount) : "",
    volumeTiers:
      coupon.discount.type === "volume_discount"
        ? coupon.discount.tiers.map((tier) => ({
            id: createTierId(),
            minQuantity: String(tier.minQuantity),
            percentage: String(tier.percentage),
          }))
        : createDefaultVolumeTiers(),
    deliverySpeed: coupon.restrictions?.deliverySpeed ?? "any",
    route: coupon.restrictions?.route ?? "all",
    specificRegion: coupon.restrictions?.specificRegion ?? "",
    parcelSizes: getRestrictedParcelSizes(coupon.restrictions),
    minWeightKg:
      coupon.restrictions?.minWeightKg !== undefined ? String(coupon.restrictions.minWeightKg) : "",
    maxWeightKg:
      coupon.restrictions?.maxWeightKg !== undefined ? String(coupon.restrictions.maxWeightKg) : "",
    customerType: coupon.restrictions?.customerType ?? "all",
    minimumOrderValue:
      coupon.restrictions?.minimumOrderValue !== undefined &&
      coupon.restrictions.minimumOrderValue !== null
        ? String(coupon.restrictions.minimumOrderValue)
        : "",
    customerPhones: getCouponPhoneNumbers(coupon),
    states: coupon.restrictions?.states ?? [],
    startDate: coupon.startDate,
    expiryDate: coupon.expiryDate,
    usageLimit: coupon.usageLimit > 0 ? String(coupon.usageLimit) : "",
    usageLimitMode: usageLimitModeFromCoupon(coupon.usageLimit),
    amountLimit: coupon.amountLimit ? String(coupon.amountLimit) : "",
    maxDiscountPerUser: coupon.maxDiscountPerUser ? String(coupon.maxDiscountPerUser) : "",
    frequencyLimit: coupon.frequency?.limit ? String(coupon.frequency.limit) : "",
    frequencyPeriod: coupon.frequency?.period ?? "",
  };
}

export function getDiscountPreview(values: CouponFormValues): string | null {
  if (values.type === "percentage_off") {
    const percentage = parseNumber(values.percentageValue);
    if (percentage === null || percentage <= 0) return null;
    const maxAmount = parseNumber(values.percentageMaxAmount);
    if (maxAmount && maxAmount > 0) {
      return `${percentage}% off, up to $${maxAmount}`;
    }
    return `${percentage}% off`;
  }

  if (values.type === "fixed_amount_off") {
    const amount = parseNumber(values.fixedAmount);
    if (amount === null || amount <= 0) return null;
    return `$${amount} off`;
  }

  const validTiers = values.volumeTiers
    .map((tier) => ({
      minQuantity: parseNumber(tier.minQuantity),
      percentage: parseNumber(tier.percentage),
    }))
    .filter(
      (tier): tier is { minQuantity: number; percentage: number } =>
        tier.minQuantity !== null &&
        tier.minQuantity > 0 &&
        tier.percentage !== null &&
        tier.percentage > 0,
    )
    .sort((a, b) => a.minQuantity - b.minQuantity);

  if (validTiers.length === 0) return null;
  return validTiers.map((tier) => `${tier.minQuantity}+ shipments at ${tier.percentage}%`).join(" · ");
}

export function applyCouponTypeChange(
  values: CouponFormValues,
  type: CouponType,
  options: { lockCode?: boolean } = {},
): CouponFormValues {
  const leavingUnlimited =
    type !== "fixed_amount_off" &&
    (values.usageLimitMode === "until_runout" || values.usageLimit === "0");

  return {
    ...values,
    type,
    discountBasis: values.discountBasis,
    code:
      options.lockCode || !values.code ? values.code : syncCouponCodePrefix(values.code, type),
    usageLimit: leavingUnlimited ? "1" : values.usageLimit,
    usageLimitMode:
      type === "fixed_amount_off"
        ? values.usageLimit === "1"
          ? "only_once"
          : values.usageLimit === "0"
            ? "until_runout"
            : values.usageLimit.trim()
              ? "custom"
              : ""
        : "",
  };
}
