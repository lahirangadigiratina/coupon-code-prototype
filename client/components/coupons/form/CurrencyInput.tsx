import { Input } from "@/components/ui/input";
import { sanitizeDecimalInput } from "@/lib/numericInput";
import { cn } from "@/lib/utils";
import { fieldInputClass } from "./FormField";

interface CurrencyInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  readOnly,
}: CurrencyInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
        AUD $
      </span>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(sanitizeDecimalInput(event.target.value))}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        readOnly={readOnly}
        className={cn("pl-[4.25rem]", fieldInputClass(error), readOnly && "cursor-default")}
      />
    </div>
  );
}
