import { useState, type ElementType } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, Copy, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { useCoupons } from "@/context/CouponsContext";
import { getEffectiveCouponStatus } from "@/lib/couponDisplay";
import { copyCouponAsDraft } from "@/lib/couponForm";
import { couponEditPath } from "@/lib/couponPaths";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types/coupon";

interface CouponRowActionsProps {
  coupon: Coupon;
}

interface ActionItem {
  label: string;
  icon: ElementType;
  iconClassName: string;
  onClick: () => void;
  destructive?: boolean;
}

export function CouponRowActions({ coupon }: CouponRowActionsProps) {
  const navigate = useNavigate();
  const { coupons, addCoupon, updateCoupon } = useCoupons();
  const { showToast } = useToast();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const status = getEffectiveCouponStatus(coupon);
  const canDeactivate = status === "active" || status === "scheduled";
  const canEdit = status === "draft" || status === "expired" || status === "exhausted";

  const handleCopy = () => {
    const copy = copyCouponAsDraft(
      coupon,
      coupons.map((item) => item.code),
    );
    addCoupon(copy);
    showToast({
      title: "Coupon copy created.",
      description: `${copy.code} was added as a draft.`,
    });
    navigate(couponEditPath(copy.code));
  };

  const primaryActions: ActionItem[] = [];

  if (canEdit) {
    primaryActions.push({
      label: "Edit",
      icon: Pencil,
      iconClassName: "bg-amber-100 text-amber-700",
      onClick: () => navigate(couponEditPath(coupon.code)),
    });
  }

  primaryActions.push({
    label: "Make a copy",
    icon: Copy,
    iconClassName: "bg-sky-100 text-sky-700",
    onClick: handleCopy,
  });

  if (canDeactivate) {
    primaryActions.push({
      label: "Deactivate",
      icon: Ban,
      iconClassName: "bg-red-100 text-red-700",
      destructive: true,
      onClick: () => setConfirmDeactivate(true),
    });
  }

  const handleDeactivate = () => {
    updateCoupon(coupon.id, {
      status: "deactivated",
      logs: [
        {
          id: `log_${crypto.randomUUID()}`,
          action: "deactivated",
          timestamp: new Date().toISOString(),
          actor: "Admin",
          note: "Coupon deactivated",
        },
        ...coupon.logs,
      ],
    });
    setConfirmDeactivate(false);
  };

  const renderAction = (action: ActionItem) => {
    const Icon = action.icon;
    return (
      <DropdownMenuItem
        key={action.label}
        onClick={action.onClick}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-50 lg:py-1.5 lg:text-xs",
          action.destructive && "text-red-700 focus:bg-red-50 focus:text-red-700",
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
            action.iconClassName,
          )}
        >
          <Icon className="h-3 w-3" />
        </span>
        <span className="font-medium leading-none">{action.label}</span>
      </DropdownMenuItem>
    );
  };

  if (primaryActions.length === 0) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-neutral-100 data-[state=open]:bg-neutral-100 lg:h-8 lg:w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions for {coupon.code}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1">
          <div className="space-y-0.5">{primaryActions.map(renderAction)}</div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDeactivate} onClose={() => setConfirmDeactivate(false)}>
        <h2 className="text-h3">Deactivate coupon</h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          {coupon.code} will be deactivated permanently and cannot be applied to bookings.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button type="button" variant="outline" onClick={() => setConfirmDeactivate(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDeactivate}>
            Deactivate
          </Button>
        </div>
      </Dialog>
    </>
  );
}
