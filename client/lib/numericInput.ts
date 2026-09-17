export function sanitizeIntegerInput(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function sanitizeDecimalInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;
}

export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/[^\d+\s()-]/g, "");
}

