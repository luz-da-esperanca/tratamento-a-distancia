import { describe, it, expect } from "vitest";
import {
  formatDateOnly,
  formatDateSafe,
  parseDateOnly,
  toDateOnlyISO,
} from "@/src/shared/utils/date";

describe("formatDateSafe", () => {
  it("formata um Date diretamente", () => {
    expect(formatDateSafe(new Date(2005, 10, 22))).toBe("22/11/2005");
  });

  it("formata uma string YYYY-MM-DD", () => {
    expect(formatDateSafe("2005-11-22")).toBe("22/11/2005");
  });

  it("retorna '—' para nulo/indefinido", () => {
    expect(formatDateSafe(null)).toBe("—");
    expect(formatDateSafe(undefined)).toBe("—");
    expect(formatDateSafe("")).toBe("—");
  });

  it("retorna '—' para data inválida", () => {
    expect(formatDateSafe("não-é-data")).toBe("—");
    expect(formatDateSafe("Wed Nov 22 2005T12:00:00")).toBe("—");
  });

  it("respeita o padrão informado", () => {
    expect(formatDateSafe("2005-11-22", "yyyy-MM-dd")).toBe("2005-11-22");
  });

  it("string YYYY-MM-DD e Date do repositório renderizam o mesmo dia (AGD-2026-7848)", () => {
    // SupabaseAppointmentRepository fazia new Date("2026-11-27") (UTC) e
    // caía para 26/11 em BRT; o acompanhamento mostrava 27/11.
    expect(formatDateSafe("2026-11-27")).toBe("27/11/2026");
    expect(formatDateSafe(parseDateOnly("2026-11-27"))).toBe("27/11/2026");
    expect(formatDateSafe("2003-08-11")).toBe("11/08/2003");
    expect(formatDateSafe(parseDateOnly("2003-08-11"))).toBe("11/08/2003");
  });

  it("parseDateOnly cria meio-dia local e round-trip sem shift", () => {
    expect(toDateOnlyISO(parseDateOnly("2026-11-27"))).toBe("2026-11-27");
    expect(toDateOnlyISO(parseDateOnly("2003-08-11"))).toBe("2003-08-11");
  });

  it("formatDateOnly aceita Date e string para cirurgia/nascimento", () => {
    expect(formatDateOnly(parseDateOnly("2026-11-27"))).toBe("27/11/2026");
    expect(formatDateOnly("2026-11-27")).toBe("27/11/2026");
    expect(formatDateOnly(null)).toBe("—");
  });

  it("cobre ramos: padrão custom, timestamp string e inválidos", () => {
    expect(formatDateOnly("2026-11-27", "dd 'de' MMM, yyyy").toLowerCase()).toContain("27 de nov");
    expect(formatDateOnly("2026-11-27 12:00:00")).toBe("27/11/2026");
    expect(formatDateOnly("2026-09-01T12:00:00")).toContain("01/09/2026");
    expect(formatDateOnly(new Date(NaN))).toBe("—");
    expect(formatDateOnly(parseDateOnly("2026-11-27"), "yyyy-MM-dd")).toBe("2026-11-27");
    expect(Number.isNaN(parseDateOnly("invalido").getTime())).toBe(true);
  });
});
