"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  code: string;
  name: string;
  leading?: ReactNode;
  searchText?: string;
  hasError?: boolean;
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Digite para buscar...",
  bordered = true,
  displayValue,
  leadingIcon,
  disabled = false,
  className = "",
  hasError
}: {
  options: SelectOption[];
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  bordered?: boolean;
  displayValue?: string;
  leadingIcon?: ReactNode;
  disabled?: boolean;
  className?: string;
  hasError?: boolean
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggleMenu() {
    if (disabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setOpen((v) => !v);
  }

  const filtered = query.trim()
    ? options.filter((o) => normalize(o.searchText ?? o.name).includes(normalize(query.trim())))
    : options;

  const wrapperClass = bordered
    ? `relative w-full max-w-[20rem] ${className}`
    : `relative ${className}`;
  const triggerClass = bordered
  ? `input input-bordered bg-background text-foreground placeholder:text-neutral/60 pr-9 cursor-pointer ${
      hasError
        ? "border-error focus:border-error"
        : "border-neutral/20 focus:border-brand"
    }`
  : `bg-transparent border-0 outline-none text-foreground placeholder:text-neutral/60 w-14 pl-7 pr-6 cursor-pointer`;
  const triggerStateClass = disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer";
  const popoverClass = bordered
    ? "z-[100] rounded-lg border border-neutral/20 bg-background shadow-lg overflow-hidden"
    : "z-[100] rounded-lg border border-neutral/20 bg-background shadow-lg overflow-hidden ring-1 ring-black/5";

  return (
    <div ref={containerRef} className={wrapperClass}>
      {leadingIcon && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {leadingIcon}
        </span>
      )}
      <input
        readOnly
        disabled={disabled}
        value={displayValue ?? value}
        placeholder={placeholder}
        onClick={toggleMenu}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`${triggerClass} ${triggerStateClass}`}
      />
      <ChevronDown
        size={16}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral pointer-events-none"
      />

      {open &&
        pos &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: bordered ? pos.width : undefined,
              minWidth: bordered ? undefined : "18rem",
            }}
            className={popoverClass}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="px-3 py-2 w-full text-foreground placeholder:text-neutral/60 outline-none border-b border-neutral/15"
            />
            <ul role="listbox" id={listId} className="max-h-60 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-neutral text-sm">Nenhum resultado</li>
              )}
              {filtered.map((o) => (
                <li key={o.code} role="option" aria-selected={value === o.name}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.name);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex items-center gap-2 px-3 py-2 w-full text-left truncate hover:bg-brand/10 ${
                      value === o.name ? "text-brand font-semibold" : "text-foreground"
                    }`}
                  >
                    {o.leading}
                    <span className="truncate">{o.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
