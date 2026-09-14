import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhoneChipInputProps {
  id: string;
  value: string[];
  onChange: (phones: string[]) => void;
}

function normalizePhone(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function phonesMatch(left: string, right: string): boolean {
  return left.replace(/\s/g, "") === right.replace(/\s/g, "");
}

export function PhoneChipInput({ id, value, onChange }: PhoneChipInputProps) {
  const [draft, setDraft] = useState("");

  const addPhone = () => {
    const next = normalizePhone(draft);
    if (!next) return;
    if (value.some((phone) => phonesMatch(phone, next))) {
      setDraft("");
      return;
    }
    onChange([...value, next]);
    setDraft("");
  };

  const removePhone = (phone: string) => {
    onChange(value.filter((item) => item !== phone));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addPhone();
    }
    if (event.key === "Backspace" && !draft && value.length > 0) {
      removePhone(value[value.length - 1]);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      )}
    >
      {value.map((phone) => (
        <span
          key={phone}
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-caption-sm font-medium text-foreground"
        >
          <span className="truncate">{phone}</span>
          <button
            type="button"
            aria-label={`Remove ${phone}`}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
            onClick={() => removePhone(phone)}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="tel"
        inputMode="tel"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? "Enter phone number" : "Add another"}
        autoComplete="off"
        className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 shrink-0 px-2"
        disabled={!normalizePhone(draft)}
        onClick={addPhone}
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </Button>
    </div>
  );
}
