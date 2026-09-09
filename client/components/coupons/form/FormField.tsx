import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({ id, label, required, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      ) : null}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-caption-sm text-destructive">
          {error}
        </p>
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-caption-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function fieldInputClass(error?: string) {
  return error ? "border-destructive focus-visible:ring-destructive" : undefined;
}
