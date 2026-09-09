import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, parseDateOnly, toIsoDate } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarProps {
  label?: string;
  value?: string;
  min?: string;
  max?: string;
  rangeStart?: string;
  rangeEnd?: string;
  showFooter?: boolean;
  onSelect: (isoDate: string) => void;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthDays(month: Date) {
  const first = startOfMonth(month);
  const leading = (first.getDay() + 6) % 7;
  const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - leading);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
    return {
      date,
      iso: toIsoDate(date),
      inMonth: date.getMonth() === month.getMonth(),
    };
  });
}

export function Calendar({
  label,
  value,
  min,
  max,
  rangeStart,
  rangeEnd,
  showFooter = true,
  onSelect,
}: CalendarProps) {
  const selected = value ? parseDateOnly(value) : null;
  const [month, setMonth] = useState(() => startOfMonth(selected ?? new Date()));

  const days = useMemo(() => buildMonthDays(month), [month]);
  const today = toIsoDate(new Date());

  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(month);

  const shiftMonth = (offset: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const isDisabled = (iso: string) => Boolean((min && iso < min) || (max && iso > max));

  const inRange = (iso: string) =>
    Boolean(rangeStart && rangeEnd && iso > rangeStart && iso < rangeEnd);

  return (
    <div className="w-[17.5rem] p-3">
      {label && (
        <p className="mb-2 text-caption-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            className="flex h-8 items-center justify-center text-caption-sm font-medium text-muted-foreground"
          >
            {weekday.slice(0, 2)}
          </span>
        ))}

        {days.map((day) => {
          const isSelected = value === day.iso;
          const disabled = isDisabled(day.iso);

          return (
            <button
              key={day.iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day.iso)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm tabular-nums transition-colors",
                !day.inMonth && "text-muted-foreground/60",
                inRange(day.iso) && "bg-accent",
                !isSelected && !disabled && "hover:bg-accent",
                day.iso === today && !isSelected && "font-semibold text-foreground ring-1 ring-inset ring-border",
                isSelected && "bg-foreground font-semibold text-background hover:bg-foreground",
                disabled && "cursor-not-allowed text-muted-foreground/40 hover:bg-transparent",
              )}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>

      {showFooter && (
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <button
            type="button"
            onClick={() => onSelect(today)}
            disabled={isDisabled(today)}
            className="text-caption-sm font-medium text-foreground transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:no-underline"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onSelect("")}
            className="text-caption-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
