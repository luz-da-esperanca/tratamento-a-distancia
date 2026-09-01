import countriesData from "world-countries";
import subdivisions from "./subdivisions.json";

export interface LocationOption {
  code: string;
  name: string;
}

function ptName(country: {
  name: { common: string };
  translations?: { por?: { common: string } };
}): string {
  return country.translations?.por?.common ?? country.name.common;
}

export const countries: LocationOption[] = (countriesData as unknown as Array<{
  cca2: string;
  name: { common: string };
  translations?: { por?: { common: string } };
}>)
  .map((c) => ({ code: c.cca2, name: ptName(c) }))
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export const codeByName: Record<string, string> = Object.fromEntries(
  countries.map((c) => [c.name, c.code]),
);

const statesByCountry = subdivisions as Record<string, LocationOption[]>;

export function getStates(code: string): LocationOption[] | null {
  const list = statesByCountry[code];
  return list && list.length ? list : null;
}

export function hasStates(code: string): boolean {
  return getStates(code) !== null;
}
