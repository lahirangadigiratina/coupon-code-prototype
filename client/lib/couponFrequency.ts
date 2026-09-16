import {
  FREQUENCY_PERIOD_LABELS,
  type Coupon,
  type FrequencyPeriod,
} from "@/types/coupon";

export function normalizeCustomerKey(value: string): string {
  return value.replace(/\s/g, "");
}

export function getFrequencyPeriodStart(period: FrequencyPeriod, now = new Date()): Date {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "day") return start;

  if (period === "month") {
    return new Date(start.getFullYear(), start.getMonth(), 1);
  }

  const weekday = start.getDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  start.setDate(start.getDate() - daysFromMonday);
  return start;
}

export function countCustomerRedemptionsInPeriod(
  coupon: Coupon,
  customerKey: string,
  now = new Date(),
): number {
  const frequency = coupon.frequency;
  if (!frequency) return 0;

  const key = normalizeCustomerKey(customerKey);
  if (!key) return 0;

  const periodStart = getFrequencyPeriodStart(frequency.period, now).getTime();
  return (coupon.redemptions ?? []).filter(
    (redemption) =>
      normalizeCustomerKey(redemption.customerKey) === key &&
      new Date(redemption.timestamp).getTime() >= periodStart,
  ).length;
}

export function isFrequencyLimitReached(
  coupon: Coupon,
  customerKey: string,
  now = new Date(),
): boolean {
  const frequency = coupon.frequency;
  if (!frequency) return false;
  return countCustomerRedemptionsInPeriod(coupon, customerKey, now) >= frequency.limit;
}

export function formatFrequencyLimit(coupon: Coupon): string {
  const frequency = coupon.frequency;
  if (!frequency) return "No frequency limit";
  const unit = FREQUENCY_PERIOD_LABELS[frequency.period].toLowerCase();
  const times = frequency.limit === 1 ? "Once" : `${frequency.limit} times`;
  return `${times} per calendar ${unit} per customer`;
}
