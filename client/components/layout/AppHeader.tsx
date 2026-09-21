import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

const navItems = [
  { to: "/coupon-codes", label: "Coupon Codes" },
  { to: "/booking", label: "Booking review" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-6 px-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-10">
          <BrandLogo />
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
