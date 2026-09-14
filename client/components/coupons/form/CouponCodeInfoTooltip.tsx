import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export function CouponCodeInfoTooltip() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number>();

  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => window.clearTimeout(closeTimer.current);
  }, []);

  return (
    <span
      ref={rootRef}
      className="relative inline-flex"
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-label="Coupon code format information"
        aria-expanded={open}
        aria-controls="coupon-code-info"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          window.clearTimeout(closeTimer.current);
          setOpen((current) => !current);
        }}
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {open ? (
        <div
          id="coupon-code-info"
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2.5rem)] rounded-xl border bg-white p-3 shadow-soft-md"
        >
          <p className="text-caption font-semibold text-foreground">Coupon code format</p>
          <p className="mt-1 font-medium tracking-wide text-caption-sm text-foreground">
            [Type prefix]-[Suffix]
          </p>
          <ul className="mt-2 space-y-0.5 text-caption-sm text-muted-foreground">
            <li>
              <span className="font-medium tracking-wide text-foreground">PC</span> – Percentage off
            </li>
            <li>
              <span className="font-medium tracking-wide text-foreground">FL</span> – Fixed amount off
            </li>
            <li>
              <span className="font-medium tracking-wide text-foreground">VL</span> – Volume discount
            </li>
          </ul>
          <p className="mt-2.5 text-caption font-semibold text-foreground">Examples</p>
          <p className="mt-1 font-medium tracking-wide text-caption-sm text-foreground">
            PC-WELC10 · FL-FLAT5 · VL-LOYAL
          </p>
          <p className="mt-2.5 text-caption-sm text-muted-foreground">
            The type prefix is generated automatically. You enter the rest of the code.
          </p>
        </div>
      ) : null}
    </span>
  );
}
