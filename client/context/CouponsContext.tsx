import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SAMPLE_COUPONS } from "@/data/coupons";
import type { Coupon } from "@/types/coupon";

interface CouponsContextValue {
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
}

const CouponsContext = createContext<CouponsContextValue | null>(null);

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

  const value = useMemo(
    () => ({ coupons, addCoupon, updateCoupon }),
    [coupons, addCoupon, updateCoupon],
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
