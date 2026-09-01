import { formatDate, isValid, parseISO } from "date-fns";

export function formatDateSafe(
  value: Date | string | null | undefined,
  pattern = "dd/MM/yyyy",
): string {
  if (value == null || value === "") return "—";
  const date = value instanceof Date ? value : parseISO(value);
  if (!isValid(date)) return "—";
  return formatDate(date, pattern);
}
