import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/coupons/form/CouponForm";
import { CouponStatusBadge } from "@/components/coupons/CouponStatusBadge";
import { useCoupons } from "@/context/CouponsContext";
import { findCouponByCode, getEffectiveCouponStatus } from "@/lib/couponDisplay";
import { couponToFormValues } from "@/lib/couponForm";
import { couponEditPath } from "@/lib/couponPaths";

export function CouponDetailsPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { coupons } = useCoupons();
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

  const status = getEffectiveCouponStatus(coupon);
  const canEdit = status === "draft" || status === "expired" || status === "exhausted";

  return (
    <CouponForm
      key={coupon.id}
      mode="view"
      initialValues={couponToFormValues(coupon)}
      existingCoupon={coupon}
      currentCode={coupon.code}
      title="Coupon Details"
      description={`View the discount, restrictions, and validity for ${coupon.code}.`}
      headerExtra={<CouponStatusBadge status={status} />}
      backTo="/coupon-codes"
      backLabel="Back to Coupon Codes"
      onCancel={() => navigate("/coupon-codes")}
      onEdit={canEdit ? () => navigate(couponEditPath(coupon.code)) : undefined}
    />
  );
}
