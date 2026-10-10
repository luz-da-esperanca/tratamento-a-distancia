import {
  getCountries,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import { parsePhoneNumber } from "libphonenumber-js";
export { isValidPhone } from "./phoneValidation";

export interface CountryPhoneOption {
  code: Country;
  name: string;
  searchText: string;
}

const regionNames = new Intl.DisplayNames(["pt"], { type: "region" });

export function countryFlag(code: string): string {
  if (code.length !== 2) return "";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((char) => base + (char.charCodeAt(0) - 65)),
  );
}

export function getCountryOptions(): CountryPhoneOption[] {
  return getCountries()
    .map((code) => {
      const name = regionNames.of(code) ?? code;
      return {
        code,
        name,
        searchText: `${name} ${getCountryCallingCode(code)}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt"));
}

export function formatPhoneDisplay(value: string): string {
  if (!value) return "";
  try {
    return parsePhoneNumber(value).formatNational();
  } catch {
    return value;
  }
}
