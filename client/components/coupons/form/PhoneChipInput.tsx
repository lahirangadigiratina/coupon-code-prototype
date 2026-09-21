import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sanitizePhoneInput } from "@/lib/numericInput";
import { cn } from "@/lib/utils";
import { SelectedPhonesDialog } from "./SelectedPhonesDialog";

const VISIBLE_CHIP_COUNT = 3;

interface PhoneChipInputProps {
  id: string;
  value: string[];
  readOnly?: boolean;
  onChange: (phones: string[]) => void;
  onAdd?: () => void;
}

function normalizePhone(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function phonesMatch(left: string, right: string): boolean {
  return left.replace(/\s/g, "") === right.replace(/\s/g, "");
}

export function PhoneChipInput({ id, value, readOnly, onChange, onAdd }: PhoneChipInputProps) {
  const [draft, setDraft] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const visiblePhones = value.slice(0, VISIBLE_CHIP_COUNT);
  const hiddenCount = Math.max(0, value.length - VISIBLE_CHIP_COUNT);

  const addDraftPhone = () => {
    const next = normalizePhone(draft);
    if (!next) return false;
    if (!value.some((phone) => phonesMatch(phone, next))) {
      onChange([...value, next]);
    }
    setDraft("");
    return true;
  };

  const removePhone = (phone: string) => {
    onChange(value.filter((item) => item !== phone));
  };

  const handleAddClick = () => {
    if (addDraftPhone()) return;
    onAdd?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addDraftPhone();
    }
    if (event.key === "Backspace" && !draft && value.length > 0) {
      removePhone(value[value.length - 1]);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex h-10 w-full flex-nowrap items-center gap-1.5 overflow-hidden rounded-md border border-input bg-background px-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}
      >
        {visiblePhones.map((phone) => (
          <span
            key={phone}
            className="inline-flex min-w-0 max-w-[7.25rem] shrink items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-caption-sm font-medium text-foreground"
          >
            <span className="truncate">{phone}</span>
            {readOnly ? null : (
              <button
                type="button"
                aria-label={`Remove ${phone}`}
                className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                onClick={() => removePhone(phone)}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {hiddenCount > 0 && (
          <button
            type="button"
            className="shrink-0 text-caption-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={() => setMoreOpen(true)}
          >
            +{hiddenCount} more
          </button>
        )}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          value={draft}
          onChange={(event) => setDraft(sanitizePhoneInput(event.target.value))}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "Enter phone number" : "Add another"}
          autoComplete="off"
          readOnly={readOnly}
          className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        {readOnly ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 px-2"
            onClick={handleAddClick}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>
      <SelectedPhonesDialog
        open={moreOpen}
        phones={value}
        onClose={() => setMoreOpen(false)}
        onChange={onChange}
      />
    </>
  );
}
