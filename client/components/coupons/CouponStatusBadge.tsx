import { cn } from "@/lib/utils";
import { COUPON_STATUS_COLORS, COUPON_STATUS_LABELS, type CouponStatus } from "@/types/coupon";

interface CouponStatusBadgeProps {
  status: CouponStatus;
  className?: string;
}

export function CouponStatusBadge({ status, className }: CouponStatusBadgeProps) {
  const colors = COUPON_STATUS_COLORS[status];

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold leading-none tracking-[0.01em]",
        className,
      )}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        boxShadow: `inset 0 0 0 1px ${colors.text}26`,
      }}
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: colors.text }}
      />
      {COUPON_STATUS_LABELS[status]}
    </span>
  );
}
