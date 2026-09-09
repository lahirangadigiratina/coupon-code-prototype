import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <Link
          to="/coupon-codes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Coupon Codes
        </Link>
        <h1 className="mt-4 text-h1">Create Coupon Code</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Create a discount code that customers can use when booking shipments.
        </p>
      </div>

      <CouponForm
        mode="create"
        existingCodes={coupons.map((coupon) => coupon.code)}
        submitLabel="Create coupon code"
        onSubmit={handleSubmit}
        onCancel={goBack}
      />
    </div>
  );
}
