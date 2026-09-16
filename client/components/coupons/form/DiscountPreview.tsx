import { getDiscountPreview } from "@/lib/couponForm";
import type { CouponFormValues } from "@/types/couponForm";

export function DiscountPreview({ values }: { values: CouponFormValues }) {
  const preview = getDiscountPreview(values);
  if (!preview) return null;

  return (
    <div className="mt-3 rounded-lg border border-dashed bg-white px-3 py-2 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{preview}</span>
      <span> given per user.</span>
    </div>
  );
}
