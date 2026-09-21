import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  PARCEL_SIZE_LABELS,
  PARCEL_SIZE_OPTION_LABELS,
  PARCEL_SIZE_SELECTABLE,
  type SelectableParcelSize,
} from "@/types/coupon";

interface ParcelSizeMultiSelectProps {
  id: string;
  value: SelectableParcelSize[];
  readOnly?: boolean;
  onChange: (sizes: SelectableParcelSize[]) => void;
}

export function ParcelSizeMultiSelect({ id, value, readOnly, onChange }: ParcelSizeMultiSelectProps) {
  const summary =
    value.length === 0 ? "Any size" : value.map((size) => PARCEL_SIZE_LABELS[size]).join(", ");

  const toggle = (size: SelectableParcelSize, checked: boolean) => {
    if (checked) {
      if (value.includes(size)) return;
      onChange([...value, size]);
      return;
    }
    onChange(value.filter((item) => item !== size));
  };

  if (readOnly) {
    return (
      <button
        id={id}
        type="button"
        disabled
        className="flex h-10 w-full cursor-default items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm opacity-100"
      >
        <span
          className={cn(
            "line-clamp-1 flex-1 text-left",
            value.length === 0 && "text-muted-foreground",
          )}
        >
          {summary}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id={id}
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span
            className={cn(
              "line-clamp-1 flex-1 text-left",
              value.length === 0 && "text-muted-foreground",
            )}
          >
            {summary}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {PARCEL_SIZE_SELECTABLE.map((size) => {
          const selected = value.includes(size);
          return (
            <DropdownMenuItem
              key={size}
              onSelect={(event) => {
                event.preventDefault();
                toggle(size, !selected);
              }}
              className="gap-2.5"
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-input bg-background",
                )}
                aria-hidden
              >
                {selected ? <Check className="h-3 w-3" /> : null}
              </span>
              {PARCEL_SIZE_OPTION_LABELS[size]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
