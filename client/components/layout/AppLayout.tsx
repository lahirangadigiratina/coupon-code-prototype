import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const location = useLocation();
  const isCouponList = location.pathname === "/coupon-codes";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-neutral-50">
      <AppHeader />
      <main
        className={cn(
          "mx-auto flex w-full min-w-0 max-w-content flex-1 flex-col px-6 py-8",
          isCouponList ? "min-h-0 overflow-hidden" : "min-h-0 overflow-y-auto",
        )}
      >
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}
