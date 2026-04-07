export function validateString(
  value: unknown,
  field: string,
  opts: { min?: number; max?: number; required?: boolean } = {}
): string | null {
  const { min = 0, max = 10000, required = true } = opts;
  if (value == null || value === "") {
    return required ? `${field} is required` : null;
  }
  if (typeof value !== "string") return `${field} must be a string`;
  const trimmed = value.trim();
  if (required && trimmed.length === 0) return `${field} cannot be empty`;
  if (trimmed.length < min) return `${field} must be at least ${min} characters`;
  if (trimmed.length > max) return `${field} must be at most ${max} characters`;
  return null;
}

export function validateEnum(value: unknown, field: string, allowed: string[]): string | null {
  if (!allowed.includes(value as string)) {
    return `${field} must be one of: ${allowed.join(", ")}`;
  }
  return null;
}

// Sanitize HTML to prevent XSS
export function sanitize(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
