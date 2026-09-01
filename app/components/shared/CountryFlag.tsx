"use client";

import * as Flags from "country-flag-icons/react/3x2";
import type { ComponentType, SVGProps } from "react";

type FlagComponent = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

const flagMap = Flags as unknown as Record<string, FlagComponent>;

export function CountryFlag({
  code,
  className = "h-4 w-5 rounded-sm",
}: {
  code: string;
  className?: string;
}) {
  const Flag = flagMap[code.toUpperCase()];
  if (!Flag) return null;
  return <Flag className={className} title={code} />;
}
