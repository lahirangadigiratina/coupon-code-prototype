import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { ToastProvider } from "@/components/ui/toast";
import { BookingCartProvider } from "@/context/BookingCartContext";
import { CouponsProvider } from "@/context/CouponsContext";
import { BookingReviewPage } from "@/pages/BookingReviewPage";
import { CouponCodesPage } from "@/pages/CouponCodesPage";
import { CouponDetailsPage } from "@/pages/CouponDetailsPage";
import { CreateCouponCodePage } from "@/pages/CreateCouponCodePage";
import { CouponLogsPage } from "@/pages/CouponLogsPage";
import { EditCouponCodePage } from "@/pages/EditCouponCodePage";

export function App() {
  return (
    <ToastProvider>
      <CouponsProvider>
        <BookingCartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="coupon-codes" element={<CouponCodesPage />} />
                <Route path="coupon-codes/create" element={<CreateCouponCodePage />} />
                <Route path="coupon-codes/:code/edit" element={<EditCouponCodePage />} />
                <Route path="coupon-codes/:code/logs" element={<CouponLogsPage />} />
                <Route path="coupon-codes/:code" element={<CouponDetailsPage />} />
              </Route>
              <Route element={<CustomerLayout />}>
                <Route path="booking" element={<BookingReviewPage />} />
              </Route>
              <Route path="/" element={<Navigate to="/coupon-codes" replace />} />
              <Route path="*" element={<Navigate to="/coupon-codes" replace />} />
            </Routes>
          </BrowserRouter>
        </BookingCartProvider>
      </CouponsProvider>
    </ToastProvider>
  );
}
