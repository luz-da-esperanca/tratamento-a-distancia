import { describe, it, expect } from "vitest";
import { formatDateSafe } from "@/src/shared/utils/date";

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
});
