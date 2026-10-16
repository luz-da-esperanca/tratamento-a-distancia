import { formatDate, isValid, parseISO } from "date-fns";

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Fonte única para datas date-only (DATE do Supabase, YYYY-MM-DD).
 * Constrói meio-dia local para nunca sofrer shift de UTC (BRT UTC-3).
 */
export function parseDateOnly(iso: string): Date {
  const match = DATE_ONLY_RE.exec(iso.trim().slice(0, 10));
  if (!match) return new Date(NaN);
  const [, ano, mes, dia] = match;
  return new Date(Number(ano), Number(mes) - 1, Number(dia), 12, 0, 0, 0);
}

/** Serializa um Date para YYYY-MM-DD pelos componentes locais (sem toISOString/UTC). */
export function toDateOnlyISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Formata date-only sem instanciar Date com timezone: strings YYYY-MM-DD
 * são fatiadas direto; Dates usam componentes locais via formatDate.
 */
export function formatDateOnly(
  value: Date | string | null | undefined,
  pattern = "dd/MM/yyyy",
): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string") {
    const text = value.trim();
    const match = DATE_ONLY_RE.exec(text.slice(0, 10));
    const isDateOnly =
      match !== null && (text.length === 10 || text[10] === "T" || text[10] === " ");
    if (isDateOnly && match) {
      const [, ano, mes, dia] = match;
      if (pattern === "dd/MM/yyyy") return `${dia}/${mes}/${ano}`;
      if (pattern === "yyyy-MM-dd") return `${ano}-${mes}-${dia}`;
      const date = new Date(Number(ano), Number(mes) - 1, Number(dia), 12, 0, 0, 0);
      if (!isValid(date)) return "—";
      return formatDate(date, pattern);
    }
    const date = parseISO(text);
    if (!isValid(date)) return "—";
    return formatDate(date, pattern);
  }
  if (!isValid(value)) return "—";
  return formatDate(value, pattern);
}

export function formatDateSafe(
  value: Date | string | null | undefined,
  pattern = "dd/MM/yyyy",
): string {
  return formatDateOnly(value, pattern);
}
