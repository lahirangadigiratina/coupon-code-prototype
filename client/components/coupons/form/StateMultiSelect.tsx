import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  AUSTRALIAN_STATE_LABELS,
  AUSTRALIAN_STATES,
  type AustralianState,
} from "@/types/coupon";

interface StateMultiSelectProps {
  id: string;
  value: AustralianState[];
  readOnly?: boolean;
  onChange: (states: AustralianState[]) => void;
}

function CheckboxMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
        selected ? "border-foreground bg-foreground text-background" : "border-input bg-background",
      )}
      aria-hidden
    >
      {selected ? <Check className="h-3 w-3" /> : null}
    </span>
  );
}

export function StateMultiSelect({ id, value, readOnly, onChange }: StateMultiSelectProps) {
  const allStates = value.length === 0;
  const summary = allStates
    ? "All states"
    : value.map((state) => AUSTRALIAN_STATE_LABELS[state]).join(", ");

  const toggle = (state: AustralianState, checked: boolean) => {
    if (checked) {
      if (value.includes(state)) return;
      onChange([...value, state]);
      return;
    }
    onChange(value.filter((item) => item !== state));
  };

  if (readOnly) {
    return (
      <button
        id={id}
        type="button"
        disabled
        className="flex h-10 w-full cursor-default items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm opacity-100"
      >
        <span className="line-clamp-1 flex-1 text-left">{summary}</span>
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
          <span className="line-clamp-1 flex-1 text-left">{summary}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            onChange([]);
          }}
          className="gap-2.5"
        >
          <CheckboxMark selected={allStates} />
          All states
        </DropdownMenuItem>
        {AUSTRALIAN_STATES.map((state) => {
          const selected = value.includes(state);
          return (
            <DropdownMenuItem
              key={state}
              onSelect={(event) => {
                event.preventDefault();
                toggle(state, !selected);
              }}
              className="gap-2.5"
            >
              <CheckboxMark selected={selected} />
              {AUSTRALIAN_STATE_LABELS[state]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
