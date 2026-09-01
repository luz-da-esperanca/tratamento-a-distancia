import { describe, it, expect } from "vitest";
import {
  parsePhoneNumber,
  isValidPhoneNumber,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import { isValidPhone } from "@/src/shared/utils/phone";

interface CountryCase {
  code: CountryCode;
  e164: string;
  intl: string;
  nat: string;
}

const cases: CountryCase[] = [
  { code: "BR", e164: "+5511961234567", intl: "+55 11 96123 4567", nat: "(11) 96123-4567" },
  { code: "US", e164: "+12015550123", intl: "+1 201 555 0123", nat: "(201) 555-0123" },
  { code: "CA", e164: "+15062345678", intl: "+1 506 234 5678", nat: "(506) 234-5678" },
  { code: "PT", e164: "+351912345678", intl: "+351 912 345 678", nat: "912 345 678" },
  { code: "ES", e164: "+34612345678", intl: "+34 612 34 56 78", nat: "612 34 56 78" },
  { code: "GB", e164: "+447400123456", intl: "+44 7400 123456", nat: "07400 123456" },
  { code: "FR", e164: "+33612345678", intl: "+33 6 12 34 56 78", nat: "06 12 34 56 78" },
  { code: "DE", e164: "+4915123456789", intl: "+49 1512 3456789", nat: "01512 3456789" },
  { code: "AR", e164: "+5491123456789", intl: "+54 9 11 2345 6789", nat: "011 15-2345-6789" },
  { code: "MX", e164: "+522221234567", intl: "+52 222 123 4567", nat: "222 123 4567" },
];

describe("formatação e limites de dígitos por país (libphonenumber-js)", () => {
  it.each(cases)(
    "$code: exemplo canônico é válido e formatado corretamente",
    ({ code, e164, intl, nat }) => {
      expect(isValidPhoneNumber(e164, code)).toBe(true);
      const parsed = parsePhoneNumber(e164, code);
      expect(parsed.format("INTERNATIONAL")).toBe(intl);
      expect(parsed.format("NATIONAL")).toBe(nat);
      expect(isValidPhone(e164)).toBe(true);
    },
  );

  it.each(cases)(
    "$code: número claramente curto é inválido (prova regra de tamanho por país)",
    ({ code }) => {
      const callingCode = getCountryCallingCode(code);
      const tooShort = `+${callingCode}123`;
      expect(isValidPhoneNumber(tooShort, code)).toBe(false);
      expect(isValidPhone(tooShort)).toBe(false);
    },
  );
});
