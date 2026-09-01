"use client";

import { CircleHelp, House, NotebookPen, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "inicio", label: "Início", icon: House, href: "/#inicio" },
  { id: "inscricao", label: "Inscrição", icon: NotebookPen, href: "/#inscricao" },
  { id: "faq", label: "Orientações", icon: CircleHelp, href: "/#faq" },
];

export function NavLinks() {
  const [active, setActive] = useState("");
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isHome]);

  const base = "gap-2 border-0 btn btn-sm rounded-lg";
  const inactive = "bg-background text-foreground hover:bg-brand hover:text-background";
  const activeCls = "bg-brand text-background";

  return (
    <div className="flex max-sm:flex-row items-center gap-2 sm:gap-3">
      {SECTIONS.map(({ id, label, icon: Icon, href }) => (
        <Link
          key={id}
          href={href}
          onClick={() => setActive(id)}
          className={`${base} ${active === id ? activeCls : inactive}`}
        >
          <Icon size={16} />
          <span className={`${active === id ? "inline" : "hidden"} sm:inline`}>
               {label}
             </span>

        </Link>
      ))}

      <Link
        href="/tratamento"
        onClick={() => setActive("tratamento")}
        className={`${base} ${pathname.startsWith("/tratamento") ? activeCls : inactive}`}
      >
        <User size={16} />
        <span className={`${pathname.startsWith("/tratamento") ? "inline" : "hidden"} sm:inline`}>
                  Acompanhar Tratamento
                </span>
      </Link>
    </div>
  );
}
