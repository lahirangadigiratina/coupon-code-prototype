import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatDate } from "@/lib/utils";

interface DateRangeInputProps {
  id: string;
  startDate: string;
  endDate: string;
  invalid?: boolean;
  readOnly?: boolean;
  className?: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

export function DateRangeInput({
  id,
  startDate,
  endDate,
  invalid,
  readOnly,
  className,
  onChange,
}: DateRangeInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const summary =
    startDate && endDate
      ? `${formatDate(startDate)} – ${formatDate(endDate)}`
      : startDate
        ? `${formatDate(startDate)} – End date`
        : endDate
          ? `Start date – ${formatDate(endDate)}`
          : "Select start and end dates";

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        aria-invalid={invalid}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={readOnly}
        onClick={() => {
          if (readOnly) return;
          setOpen((current) => !current);
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-100 disabled:hover:bg-background",
          invalid && "border-destructive focus-visible:ring-destructive",
          className,
        )}
      >
        <span className={cn((!startDate || !endDate) && "text-muted-foreground")}>{summary}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(calc(100vw-2.5rem),37rem)] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-soft-md">
          <div className="grid sm:grid-cols-2">
            <div className="border-b sm:border-b-0 sm:border-r">
              <Calendar
                label="Start date"
                value={startDate}
                max={endDate || undefined}
                rangeStart={startDate}
                rangeEnd={endDate}
                showFooter={false}
                onSelect={(nextStart) => {
                  onChange({
                    startDate: nextStart,
                    endDate: endDate && nextStart && endDate < nextStart ? nextStart : endDate,
                  });
                }}
              />
            </div>
            <div>
              <Calendar
                label="End date"
                value={endDate}
                min={startDate || undefined}
                rangeStart={startDate}
                rangeEnd={endDate}
                showFooter={false}
                onSelect={(nextEnd) => {
                  onChange({
                    startDate: startDate && nextEnd && nextEnd < startDate ? nextEnd : startDate,
                    endDate: nextEnd,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
