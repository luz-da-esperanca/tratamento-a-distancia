"use client";

import { useMemo } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { Country } from "react-phone-number-input";
import { SearchableSelect } from "./SearchableSelect";
import { CountryFlag } from "./CountryFlag";
import { getCountryOptions } from "@/src/shared/utils/phone";

function PhoneCountrySelect(props: {
  value?: Country;
  onChange: (country?: Country) => void;
  disabled?: boolean;
}) {
  const options = useMemo(
    () =>
      getCountryOptions().map((country) => ({
        ...country,
        leading: <CountryFlag code={country.code} />,
      })),
    [],
  );
  const selected = options.find((country) => country.code === props.value);
  const selectedName = selected?.name ?? "";

  return (
    <SearchableSelect
      bordered={false}
      options={options}
      value={selectedName}
      displayValue=""
      disabled={props.disabled}
      leadingIcon={selected ? <CountryFlag code={selected.code} /> : <CountryFlag code="BR" />}
      onChange={(name) => {
        const found = options.find((country) => country.name === name);
        props.onChange(found?.code);
      }}
      placeholder=""
      searchPlaceholder="Buscar país ou DDI..."
    />
  );
}

export function PhoneField({
  value,
  onChange,
  required = false,
  disabled = false,
  hasError = false
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean
}) {
  return (
    <PhoneInput
      international
      defaultCountry="BR"
      required={required}
      disabled={disabled}
      limitMaxLength
      countryCallingCodeEditable={false}
      placeholder="(85) 98888-8888"
      value={value}
      onChange={(newValue) => onChange(newValue ?? "")}
      countrySelectComponent={PhoneCountrySelect}
      className={`phone-input-custom input input-bordered bg-background flex items-center gap-1 text-foreground pl-1 ${
        hasError
          ? "border-error focus:border-error"
          : "border-neutral/20 focus:border-brand"
      }${disabled ? " opacity-50" : ""}`}
      numberInputProps={{
        required,
        "aria-invalid": hasError,
        "aria-describedby": hasError ? "erro-celular" : undefined,
        className:
          "bg-transparent border-0 outline-none text-foreground placeholder:text-neutral/60 w-full h-full min-w-0",
      }}
    />
  );
}
