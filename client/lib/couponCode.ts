import type { CouponType } from "@/types/coupon";

export const COUPON_PREFIX = "PLS" as const;

const LEGACY_PREFIX_PATTERN = /^(PLS|PC|FL|VL)-?/;
const CODE_PATTERN = /^PLS-([A-HJKMNP-Z2-9]{4,8})$/;
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function getCouponPrefix(_type?: CouponType): typeof COUPON_PREFIX {
  return COUPON_PREFIX;
}

export function getCodePrefixLabel(code: string): string {
  const normalized = normalizeCouponCodeInput(code);
  const match = /^(PLS|PC|FL|VL)(?=-|$)/.exec(normalized);
  return match?.[1] ?? COUPON_PREFIX;
}

export function normalizeCouponCodeInput(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export function normalizeCouponCodeSuffix(raw: string): string {
  return raw.toUpperCase().replace(/[^A-HJKMNP-Z2-9]/g, "").slice(0, 8);
}

export function getCouponCodeSuffix(code: string, _type?: CouponType): string {
  const normalized = normalizeCouponCodeInput(code);
  return normalized.replace(LEGACY_PREFIX_PATTERN, "").replace(/^-/, "");
}

export function composeCouponCode(suffix: string, _type?: CouponType): string {
  const cleanSuffix = normalizeCouponCodeSuffix(suffix);
  if (!cleanSuffix) return `${COUPON_PREFIX}-`;
  return `${COUPON_PREFIX}-${cleanSuffix}`;
}

export function generateCouponCodeSuffix(length = 6): string {
  const size = Math.min(8, Math.max(4, length));
  let suffix = "";
  for (let index = 0; index < size; index += 1) {
    suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return suffix;
}

export function generateUniqueCouponCode(_type: CouponType, existingCodes: string[] = []): string {
  const taken = new Set(existingCodes.map((code) => code.toUpperCase()));
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const code = `${COUPON_PREFIX}-${generateCouponCodeSuffix()}`;
    if (!taken.has(code)) return code;
  }
  return `${COUPON_PREFIX}-${generateCouponCodeSuffix(8)}`;
}

export function syncCouponCodePrefix(code: string, _type?: CouponType): string {
  const trimmed = normalizeCouponCodeInput(code).replace(/-+/g, "-");
  if (!trimmed) return "";

  const suffix = trimmed.replace(LEGACY_PREFIX_PATTERN, "").replace(/^-/, "");
  if (!suffix) return `${COUPON_PREFIX}-`;
  return `${COUPON_PREFIX}-${suffix}`;
}

export function ensureCouponCodePrefix(code: string, type?: CouponType): string {
  const normalized = normalizeCouponCodeInput(code);
  if (!normalized || normalized === `${COUPON_PREFIX}-`) {
    return `${COUPON_PREFIX}-`;
  }
  return syncCouponCodePrefix(normalized, type);
}

export function validateCouponCode(code: string, _type?: CouponType): string | null {
  const normalized = normalizeCouponCodeInput(code).trim();

  if (!normalized || normalized === `${COUPON_PREFIX}-`) {
    return "Coupon code is required.";
  }

  if (normalized.length < 8 || normalized.length > 12 || !CODE_PATTERN.test(normalized)) {
    return "Use the PLS- prefix and 4–8 characters for the rest of the code.";
  }

  return null;
}
