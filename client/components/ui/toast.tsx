import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastVariantStyles: Record<
  ToastVariant,
  {
    container: string;
    icon: string;
    title: string;
    description: string;
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50",
    icon: "text-emerald-600",
    title: "text-emerald-950",
    description: "text-emerald-800",
    Icon: CheckCircle2,
  },
  error: {
    container: "border-red-200 bg-red-50",
    icon: "text-red-600",
    title: "text-red-950",
    description: "text-red-800",
    Icon: AlertCircle,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { variant: "success", ...toast, id }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed inset-x-4 bottom-4 z-[100] flex max-w-sm flex-col gap-2 sm:inset-x-auto sm:right-4">
          {toasts.map((toast) => {
            const variant = toast.variant ?? "success";
            const styles = toastVariantStyles[variant];
            const Icon = styles.Icon;

            return (
              <div
                key={toast.id}
                role="status"
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 shadow-soft-md",
                  "animate-in slide-in-from-bottom-4 fade-in-0",
                  styles.container,
                )}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", styles.icon)} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold", styles.title)}>{toast.title}</p>
                  {toast.description && (
                    <p className={cn("mt-0.5 text-sm", styles.description)}>{toast.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className={cn("shrink-0 opacity-70 hover:opacity-100", styles.title)}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
