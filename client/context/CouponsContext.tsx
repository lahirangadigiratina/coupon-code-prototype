import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SAMPLE_COUPONS } from "@/data/coupons";
import {
  getActivationBlock,
  getEffectiveCouponStatus,
} from "@/lib/couponDisplay";
import type { CouponStatusChangeResult } from "@/lib/couponStatus";
import type { Coupon, CouponLog, CouponStatus } from "@/types/coupon";

interface CouponsContextValue {
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
  setCouponStatus: (id: string, status: Extract<CouponStatus, "active" | "inactive">) => CouponStatusChangeResult;
}

const CouponsContext = createContext<CouponsContextValue | null>(null);

function createLogId() {
  return `log_${crypto.randomUUID()}`;
}

function createStatusLog(status: "active" | "inactive"): CouponLog {
  return {
    id: createLogId(),
    action: status === "active" ? "activated" : "deactivated",
    timestamp: new Date().toISOString(),
    actor: "Admin",
    note: status === "active" ? "Status changed to Active" : "Status changed to Inactive",
  };
}

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(SAMPLE_COUPONS);

  const addCoupon = useCallback((coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
  }, []);

  const updateCoupon = useCallback((id: string, patch: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((coupon) => (coupon.id === id ? { ...coupon, ...patch, id: coupon.id } : coupon)),
    );
  }, []);

  const setCouponStatus = useCallback(
    (id: string, status: Extract<CouponStatus, "active" | "inactive">): CouponStatusChangeResult => {
      const coupon = coupons.find((item) => item.id === id);
      if (!coupon) return { ok: false, reason: "not_allowed" };

      if (status === "active") {
        const block = getActivationBlock(coupon);
        if (block) return { ok: false, reason: block };
        if (getEffectiveCouponStatus(coupon) === "active") return { ok: false, reason: "not_allowed" };
      }

      if (status === "inactive") {
        if (getEffectiveCouponStatus(coupon) === "expired") return { ok: false, reason: "expired" };
        if (getEffectiveCouponStatus(coupon) !== "active") return { ok: false, reason: "not_allowed" };
      }

      setCoupons((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            status,
            logs: [createStatusLog(status), ...item.logs],
          };
        }),
      );

      return { ok: true, nextStatus: status };
    },
    [coupons],
  );

  const value = useMemo(
    () => ({ coupons, addCoupon, updateCoupon, setCouponStatus }),
    [coupons, addCoupon, updateCoupon, setCouponStatus],
  );

  return <CouponsContext.Provider value={value}>{children}</CouponsContext.Provider>;
}

export function useCoupons() {
  const context = useContext(CouponsContext);
  if (!context) {
    throw new Error("useCoupons must be used within CouponsProvider");
  }
  return context;
}
