import { describe, it, expect } from "vitest";
import {
  countries,
  getStates,
  hasStates,
  codeByName,
} from "@/src/shared/infrastructure/data/locations";

describe("locations data", () => {
  it("lists countries with Portuguese names", () => {
    expect(countries.some((c) => c.name === "Brasil")).toBe(true);
    expect(countries.some((c) => c.name === "França")).toBe(true);
  });

  it("returns Brazilian states (27 UFs)", () => {
    const br = getStates("BR");
    expect(br).not.toBeNull();
    expect(br!.length).toBe(27);
    expect(br!.some((s) => s.name === "Ceará")).toBe(true);
  });

  it("returns German states (16 Bundesländer)", () => {
    const de = getStates("DE");
    expect(de).not.toBeNull();
    expect(de!.length).toBe(16);
    expect(de!.some((s) => s.name === "Bayern")).toBe(true);
  });

  it("returns French regions (top-level)", () => {
    const fr = getStates("FR");
    expect(fr).not.toBeNull();
    expect(fr!.some((s) => s.name === "Île-de-France")).toBe(true);
  });

  it("returns null / false for unknown country", () => {
    expect(getStates("ZZ")).toBeNull();
    expect(hasStates("ZZ")).toBe(false);
  });

  it("maps country name to ISO code", () => {
    expect(codeByName["Brasil"]).toBe("BR");
    expect(codeByName["Alemanha"]).toBe("DE");
  });
});
