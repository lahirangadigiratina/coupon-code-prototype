import type { ElementType } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FileText, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { couponDetailsPath, couponEditPath, couponLogsPath } from "@/lib/couponPaths";
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

  const primaryActions: ActionItem[] = [
    {
      label: "View details",
      icon: Eye,
      iconClassName: "bg-sky-100 text-sky-700",
      onClick: () => navigate(couponDetailsPath(coupon.code)),
    },
    {
      label: "Edit",
      icon: Pencil,
      iconClassName: "bg-amber-100 text-amber-700",
      onClick: () => navigate(couponEditPath(coupon.code)),
    },
  ];

  const secondaryActions: ActionItem[] = [
    {
      label: "View logs",
      icon: FileText,
      iconClassName: "bg-violet-100 text-violet-700",
      onClick: () => navigate(couponLogsPath(coupon.code)),
    },
  ];

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
          <DropdownMenuSeparator className="my-1" />
          <div className="space-y-0.5">{secondaryActions.map(renderAction)}</div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
