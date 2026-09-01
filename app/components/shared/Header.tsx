import { NavLinks } from "@/components/shared/NavLinks";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="top-0 z-50 sticky bg-brand backdrop-blur border-neutral/15">
      <div className="flex justify-center bg-background h-10 sm:h-8" />
      <nav className="flex max-md:flex-col justify-between items-center gap-4 mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full max-w-7xl">
        <Link href="/#inicio" className="font-semibold text-background text-lg uppercase tracking-[0.22em]">
          <Image className="bg-background -mt-14 p-2 rounded-b-xl" src="/logo.png" width={150} height={75} alt="Logo da Luz Esperança" />
        </Link>

        <NavLinks />
      </nav>
    </header>
  );
}
