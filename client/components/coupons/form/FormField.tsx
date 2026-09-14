import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  hintAction?: ReactNode;
  error?: string;
  className?: string;
  labelAddon?: ReactNode;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  required,
  hint,
  hintAction,
  error,
  className,
  labelAddon,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={id} className="inline-flex items-center gap-1.5">
          <span>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </span>
          {labelAddon}
        </Label>
      ) : null}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-caption-sm text-destructive">
          {error}
        </p>
      )}
      {(hint || hintAction) && (
        <div className="flex items-start justify-between gap-3">
          {hint ? (
            <p id={`${id}-hint`} className="text-caption-sm text-muted-foreground">
              {hint}
            </p>
          ) : null}
          {hintAction}
        </div>
      )}
    </div>
  );
}

export function fieldInputClass(error?: string) {
  return error ? "border-destructive focus-visible:ring-destructive" : undefined;
}
