import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_BOOKING_CART, type BookingCart } from "@/types/booking";

interface BookingCartContextValue {
  cart: BookingCart;
  updateCart: (patch: Partial<BookingCart>) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  resetCart: () => void;
}

const BookingCartContext = createContext<BookingCartContextValue | null>(null);

export function BookingCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<BookingCart>(DEFAULT_BOOKING_CART);

  const updateCart = useCallback((patch: Partial<BookingCart>) => {
    setCart((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyCoupon = useCallback((code: string) => {
    setCart((prev) => ({ ...prev, appliedCouponCode: code.toUpperCase() }));
  }, []);

  const removeCoupon = useCallback(() => {
    setCart((prev) => ({ ...prev, appliedCouponCode: null }));
  }, []);

  const resetCart = useCallback(() => {
    setCart(DEFAULT_BOOKING_CART);
  }, []);

  const value = useMemo(
    () => ({ cart, updateCart, applyCoupon, removeCoupon, resetCart }),
    [applyCoupon, cart, removeCoupon, resetCart, updateCart],
  );

  return <BookingCartContext.Provider value={value}>{children}</BookingCartContext.Provider>;
}

export function useBookingCart() {
  const context = useContext(BookingCartContext);
  if (!context) {
    throw new Error("useBookingCart must be used within BookingCartProvider");
  }
  return context;
}
