export function couponDetailsPath(code: string): string {
  return `/coupon-codes/${encodeURIComponent(code)}`;
}

export function couponEditPath(code: string): string {
  return `/coupon-codes/${encodeURIComponent(code)}/edit`;
}

export function couponLogsPath(code: string): string {
  return `/coupon-codes/${encodeURIComponent(code)}/logs`;
}
