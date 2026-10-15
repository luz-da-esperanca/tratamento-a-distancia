export function formatDateMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  let masked = day;
  if (digits.length > 2) masked += `/${month}`;
  if (digits.length > 4) masked += `/${year}`;
  return masked;
}

export function toISODate(masked: string): string {
  const match = masked.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function isNascimentoValido(iso: string): boolean {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, ano, mes, dia] = match;
  // Constrói por componentes e confere: sem isso, dias impossíveis sofrem
  // rollover (ex.: 2000-02-30 vira 01/03) e passam como válidos.
  const date = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (
    date.getFullYear() !== Number(ano) ||
    date.getMonth() !== Number(mes) - 1 ||
    date.getDate() !== Number(dia)
  ) {
    return false;
  }
  const limite = new Date();
  limite.setHours(23, 59, 59, 999);
  if (date > limite) return false;
  if (date.getFullYear() < 1900) return false;
  return true;
}
