import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/coupons/form/CouponForm";
import { useToast } from "@/components/ui/toast";
import { useCoupons } from "@/context/CouponsContext";
import { findCouponByCode } from "@/lib/couponDisplay";
import { couponToFormValues } from "@/lib/couponForm";
import { couponDetailsPath } from "@/lib/couponPaths";
import type { Coupon } from "@/types/coupon";

export function EditCouponCodePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { coupons, updateCoupon } = useCoupons();
  const { showToast } = useToast();
  const coupon = findCouponByCode(coupons, code);

  if (!coupon) {
    return (
      <div className="space-y-4">
        <Link
          to="/coupon-codes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Coupon Codes
        </Link>
        <h1 className="text-h1">Coupon not found</h1>
        <p className="text-body-sm text-muted-foreground">
          That coupon code does not exist in this prototype.
        </p>
      </div>
    );
  }

  const detailsPath = couponDetailsPath(coupon.code);

  const handleSubmit = (updated: Coupon) => {
    updateCoupon(coupon.id, updated);
    showToast({
      title: "Coupon updated successfully.",
      description: `${coupon.code} has been saved.`,
    });
    navigate(detailsPath);
  };

  return (
    <CouponForm
      key={coupon.id}
      mode="edit"
      initialValues={couponToFormValues(coupon)}
      existingCoupon={coupon}
      currentCode={coupon.code}
      title="Edit Coupon Code"
      description={`Update the discount, restrictions, and validity for ${coupon.code}. The coupon code itself cannot be changed.`}
      backTo={detailsPath}
      backLabel="Back to Coupon Details"
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onCancel={() => navigate(detailsPath)}
    />
  );
}
