import { COUPON_TYPE_LABELS, type CouponType } from "@/types/coupon";

export const COUPON_PREFIX: Record<CouponType, "PC" | "FL" | "VL"> = {
  percentage_off: "PC",
  fixed_amount_off: "FL",
  volume_discount: "VL",
};

const PREFIX_PATTERN = /^(PC|FL|VL)-?/;
const CODE_PATTERN = /^(PC|FL|VL)-([A-HJKMNP-Z2-9]{4,8})$/;
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function getCouponPrefix(type: CouponType): "PC" | "FL" | "VL" {
  return COUPON_PREFIX[type];
}

export function normalizeCouponCodeInput(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export function normalizeCouponCodeSuffix(raw: string): string {
  return raw.toUpperCase().replace(/[^A-HJKMNP-Z2-9]/g, "").slice(0, 8);
}

export function getCouponCodeSuffix(code: string, type: CouponType): string {
  const prefix = `${getCouponPrefix(type)}-`;
  const normalized = normalizeCouponCodeInput(code);
  if (normalized.startsWith(prefix)) return normalized.slice(prefix.length);
  return normalized.replace(PREFIX_PATTERN, "").replace(/^-/, "");
}

export function composeCouponCode(suffix: string, type: CouponType): string {
  const cleanSuffix = normalizeCouponCodeSuffix(suffix);
  if (!cleanSuffix) return `${getCouponPrefix(type)}-`;
  return `${getCouponPrefix(type)}-${cleanSuffix}`;
}

export function generateCouponCodeSuffix(length = 6): string {
  const size = Math.min(8, Math.max(4, length));
  let suffix = "";
  for (let index = 0; index < size; index += 1) {
    suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return suffix;
}

export function generateUniqueCouponCode(type: CouponType, existingCodes: string[] = []): string {
  const taken = new Set(existingCodes.map((code) => code.toUpperCase()));
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const code = `${getCouponPrefix(type)}-${generateCouponCodeSuffix()}`;
    if (!taken.has(code)) return code;
  }
  return `${getCouponPrefix(type)}-${generateCouponCodeSuffix(8)}`;
}

export function syncCouponCodePrefix(code: string, type: CouponType): string {
  const prefix = getCouponPrefix(type);
  const trimmed = normalizeCouponCodeInput(code).replace(/-+/g, "-");
  if (!trimmed) return "";

  const suffix = trimmed.replace(PREFIX_PATTERN, "").replace(/^-/, "");
  if (!suffix) return `${prefix}-`;
  return `${prefix}-${suffix}`;
}

export function ensureCouponCodePrefix(code: string, type: CouponType): string {
  const normalized = normalizeCouponCodeInput(code);
  if (!normalized || normalized === `${getCouponPrefix(type)}-`) {
    return `${getCouponPrefix(type)}-`;
  }
  return syncCouponCodePrefix(normalized, type);
}

export function validateCouponCode(code: string, type: CouponType): string | null {
  const normalized = normalizeCouponCodeInput(code).trim();
  const prefix = getCouponPrefix(type);

  if (!normalized || normalized === `${prefix}-`) {
    return "Coupon code is required.";
  }

  if (normalized.length < 8 || normalized.length > 11 || !CODE_PATTERN.test(normalized)) {
    return "Use 8–11 characters with uppercase letters, numbers, and one hyphen.";
  }

  const match = CODE_PATTERN.exec(normalized);
  if (!match || match[1] !== prefix) {
    return `Use the ${prefix}- prefix for ${COUPON_TYPE_LABELS[type]}.`;
  }

  return null;
}
