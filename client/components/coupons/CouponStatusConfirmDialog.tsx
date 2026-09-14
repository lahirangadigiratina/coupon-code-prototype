import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Coupon } from "@/types/coupon";

export type CouponStatusDialogAction = "activate" | "deactivate";

interface CouponStatusConfirmDialogProps {
  coupon: Coupon | null;
  action: CouponStatusDialogAction | null;
  onClose: () => void;
}

export function CouponStatusConfirmDialog({
  coupon,
  action,
  onClose,
}: CouponStatusConfirmDialogProps) {
  return (
    <Dialog open={Boolean(coupon && action)} onClose={onClose}>
      <h2 className="text-h3">Status is automatic</h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        Coupon status is set from validity dates and usage. It can be Active, Scheduled, Exhausted,
        or Expired.
      </p>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}
