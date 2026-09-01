import { describe, it, expect } from "vitest";
import {
  countryFlag,
  getCountryOptions,
  isValidPhone,
  formatPhoneDisplay,
} from "@/src/shared/utils/phone";

describe("phone utils", () => {
  it("countryFlag gera emoji da bandeira a partir do ISO-2", () => {
    expect(countryFlag("BR")).toBe("🇧🇷");
    expect(countryFlag("US")).toBe("🇺🇸");
    expect(countryFlag("")).toBe("");
  });

  it("getCountryOptions lista países com nome e DDI pesquisável", () => {
    const options = getCountryOptions();
    const brasil = options.find((o) => o.code === "BR");
    expect(brasil).toBeDefined();
    expect(brasil?.name).toBe("Brasil");
    expect(brasil?.searchText).toContain("Brasil");
    expect(brasil?.searchText).toContain("55");
    // está ordenado por nome
    const names = options.map((o) => o.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "pt"));
    expect(names).toEqual(sorted);
  });

  it("isValidPhone valida números E.164", () => {
    expect(isValidPhone("+5585988888888")).toBe(true);
    expect(isValidPhone("+351912345678")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });

  it("formatPhoneDisplay formata para o padrão nacional", () => {
    expect(formatPhoneDisplay("+5511961234567")).toBe("(11) 96123-4567");
    expect(formatPhoneDisplay("")).toBe("");
    expect(formatPhoneDisplay("+55")).toBe("+55");
  });
});
