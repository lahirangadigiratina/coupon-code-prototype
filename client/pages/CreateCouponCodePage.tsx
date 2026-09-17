import { useNavigate } from "react-router-dom";
import { CouponForm } from "@/components/coupons/form/CouponForm";
import { useToast } from "@/components/ui/toast";
import { useCoupons } from "@/context/CouponsContext";
import type { Coupon } from "@/types/coupon";

export function CreateCouponCodePage() {
  const navigate = useNavigate();
  const { coupons, addCoupon } = useCoupons();
  const { showToast } = useToast();

  const goBack = () => navigate("/coupon-codes");

  const handleSubmit = (coupon: Coupon) => {
    addCoupon(coupon);
    showToast({
      title: "Coupon code created successfully.",
      description: `${coupon.code} has been added to the coupon list.`,
    });
    navigate("/coupon-codes");
  };

  return (
    <CouponForm
      mode="create"
      existingCodes={coupons.map((coupon) => coupon.code)}
      title="Create Coupon Code"
      description="Create a discount code that customers can use when booking shipments."
      backTo="/coupon-codes"
      backLabel="Back to Coupon Codes"
      submitLabel="Generate coupon code"
      onSubmit={handleSubmit}
      onCancel={goBack}
    />
  );
}
