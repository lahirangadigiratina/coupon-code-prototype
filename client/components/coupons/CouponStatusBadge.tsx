import { cn } from "@/lib/utils";
import { COUPON_STATUS_LABELS, type CouponStatus } from "@/types/coupon";

const statusStyles: Record<CouponStatus, { badge: string; dot: string }> = {
  active: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  scheduled: {
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  exhausted: {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  expired: {
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

interface CouponStatusBadgeProps {
  status: CouponStatus;
  className?: string;
}

export function CouponStatusBadge({ status, className }: CouponStatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-caption-sm font-medium",
        styles.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {COUPON_STATUS_LABELS[status]}
    </span>
  );
}
