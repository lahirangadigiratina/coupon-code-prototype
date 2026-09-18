import { getDiscountPreview } from "@/lib/couponForm";
import type { CouponFormValues } from "@/types/couponForm";

export function DiscountPreview({ values }: { values: CouponFormValues }) {
  const preview = getDiscountPreview(values);
  if (!preview) return null;

  return (
    <div className="min-w-0 flex-1 rounded-lg border border-dashed bg-white px-3 py-2 text-sm text-muted-foreground sm:mr-4">
      <span className="font-medium text-foreground">{preview}</span>
      <span> given per user.</span>
    </div>
  );
}
