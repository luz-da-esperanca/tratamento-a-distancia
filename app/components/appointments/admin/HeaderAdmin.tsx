import Link from "next/link";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { logoutAction } from "@/src/features/auth/presentation/actions/auth.actions";

export function HeaderAdmin() {
  return (
    <header className="top-0 z-50 sticky bg-brand backdrop-blur border-neutral/15">
      <div className="flex justify-center bg-background h-8"/>
      <nav className="flex max-md:flex-col justify-between items-center gap-4 mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full max-w-7xl">
        <Link href="/admin" className="font-semibold text-background text-lg uppercase tracking-[0.22em]">
          <Image className="bg-background -mt-14 p-2 rounded-b-xl" src="/logo.png" width={150} height={75} alt="Logo da Luz Esperança" />
        </Link>

        <form action={logoutAction} className="flex items-center gap-4 sm:gap-6">
          <span className="hidden sm:inline font-bold text-background/80 text-sm uppercase">Painel Administrativo</span>
          <button 
            type="submit"
            className="gap-2 bg-background hover:bg-error hover:border-error text-foreground hover:text-background btn btn-sm"
          >
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </nav>
    </header>
  );
}
