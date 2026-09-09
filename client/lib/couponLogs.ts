import {
  COUPON_LOG_ACTION_LABELS,
  type CouponLog,
  type CouponLogAction,
  type CouponLogFilter,
} from "@/types/coupon";

export function logMatchesFilter(log: CouponLog, filter: CouponLogFilter): boolean {
  if (filter === "all") return true;
  if (filter === "limit_reached") {
    return log.action === "usage_limit_reached" || log.action === "amount_limit_reached";
  }
  return log.action === filter;
}

export function logMatchesSearch(log: CouponLog, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  const haystack = [COUPON_LOG_ACTION_LABELS[log.action], log.actor, log.note ?? ""]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export function sortLogsNewestFirst(logs: CouponLog[]): CouponLog[] {
  return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function isLimitLogAction(action: CouponLogAction): boolean {
  return action === "usage_limit_reached" || action === "amount_limit_reached";
}
