import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useCoupons } from "@/context/CouponsContext";
import { getStatusChangeErrorMessage } from "@/lib/couponStatus";
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
  const { setCouponStatus } = useCoupons();
  const { showToast } = useToast();

  const isActivate = action === "activate";

  const handleConfirm = () => {
    if (!coupon || !action) return;

    const result = setCouponStatus(coupon.id, isActivate ? "active" : "inactive");
    if (!result.ok) {
      showToast({
        variant: "error",
        title: getStatusChangeErrorMessage(result.reason),
      });
    } else {
      showToast({
        title: isActivate ? "Coupon activated successfully." : "Coupon deactivated successfully.",
        description: `${coupon.code} is now ${isActivate ? "available" : "unavailable"} for shipment bookings.`,
      });
    }
    onClose();
  };

  return (
    <Dialog open={Boolean(coupon && action)} onClose={onClose}>
      <h2 className="text-h3">{isActivate ? "Activate coupon?" : "Deactivate coupon?"}</h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        {isActivate
          ? "This coupon will become available for customers to use again."
          : "This coupon will no longer be available for customers to use. You can activate it again later."}
      </p>
      {coupon && (
        <p className="mt-4 break-all rounded-lg border bg-neutral-50 px-3 py-2 text-sm font-semibold tracking-wide">
          {coupon.code}
        </p>
      )}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant={isActivate ? "default" : "destructive"}
          className="w-full sm:w-auto"
          onClick={handleConfirm}
        >
          {isActivate ? "Activate coupon" : "Deactivate coupon"}
        </Button>
      </div>
    </Dialog>
  );
}
