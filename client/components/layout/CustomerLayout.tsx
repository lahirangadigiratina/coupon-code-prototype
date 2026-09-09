import { Link, Outlet } from "react-router-dom";
import { Package } from "lucide-react";

export function CustomerLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-neutral-50">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-6 px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">Shipment booking</p>
              <p className="text-[11px] text-muted-foreground">Review and confirm</p>
            </div>
          </div>
          <Link
            to="/coupon-codes"
            className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Admin portal
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-content px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
