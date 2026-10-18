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

// Tempo em que scroll/resize após a abertura são tratados como efeitos do
// teclado virtual abrindo no celular, não como gesto do usuário.
const OPEN_GRACE_MS = 700;

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
  const openedAtRef = useRef(0);
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

    function keyboardOpen(): boolean {
      const vv = window.visualViewport;
      return vv != null && vv.height < window.innerHeight - 100;
    }

    // Popover é fixed: com o teclado virtual aberto, abre acima do campo
    // quando não houver espaço embaixo, para busca e lista ficarem visíveis.
    function reposition() {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const vv = window.visualViewport;
      const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      const popoverHeight = popoverRef.current?.offsetHeight ?? 0;
      const openUp = popoverHeight > 0 && visibleBottom - rect.bottom < popoverHeight + 8;
      setPos({
        top: openUp ? Math.max(4, rect.top - popoverHeight - 4) : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }

    function onScroll(event: Event) {
      // Ignora scroll originado dentro do popover (lista interna) —
      // senão deslizar a lista fecha o select no meio do gesto.
      const target = event.target;
      if (target instanceof Node && popoverRef.current?.contains(target)) {
        return;
      }
      // No celular, o autofocus da busca abre o teclado e a viewport se
      // ajusta com scroll/resize sintéticos. Fechar aqui engolia o select
      // e o teclado juntos; reposicionamos e mantemos aberto.
      if (Date.now() - openedAtRef.current < OPEN_GRACE_MS || keyboardOpen()) {
        reposition();
        return;
      }
      setOpen(false);
    }

    function onResize() {
      if (Date.now() - openedAtRef.current < OPEN_GRACE_MS || keyboardOpen()) {
        reposition();
        return;
      }
      setOpen(false);
    }

    // Mudanças do visualViewport são o teclado virtual: nunca fecham,
    // apenas reposicionam.
    function onViewportChange() {
      reposition();
    }

    const viewport = window.visualViewport;
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    viewport?.addEventListener("resize", onViewportChange);
    viewport?.addEventListener("scroll", onViewportChange);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      viewport?.removeEventListener("resize", onViewportChange);
      viewport?.removeEventListener("scroll", onViewportChange);
    };
  }, [open]);

  function toggleMenu() {
    if (disabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    openedAtRef.current = Date.now();
    setOpen((v) => !v);
  }

  const filtered = query.trim()
    ? options.filter((o) => normalize(o.searchText ?? o.name).includes(normalize(query.trim())))
    : options;

  const wrapperClass = bordered
    ? `relative w-full ${className}`
    : `relative ${className}`;
  const triggerClass = bordered
  ? `input input-bordered w-full bg-background text-foreground placeholder:text-neutral/60 pr-9 cursor-pointer ${
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
            <ul role="listbox" id={listId} className="max-h-60 overflow-y-auto overscroll-contain">
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
