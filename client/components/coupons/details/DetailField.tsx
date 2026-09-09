import type { ReactNode } from "react";

interface DetailFieldProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export function DetailField({ label, value, hint }: DetailFieldProps) {
  return (
    <div className="min-w-0">
      <dt className="text-caption-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
      {hint && <p className="mt-1 text-caption-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
