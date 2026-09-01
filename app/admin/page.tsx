import Link from "next/link";
import { Lock, LogIn } from "lucide-react";

export default function AdminLanding() {
    return (
        <div className="flex flex-col bg-brand min-h-screen text-foreground">
            <main className="flex justify-center items-center p-4 grow">
                <div className="space-y-8 bg-card shadow-sm p-10 border border-neutral/15 rounded-3xl w-full max-w-md text-center">
                    <div className="flex justify-center items-center bg-brand/10 mx-auto rounded-2xl w-20 h-20">
                        <Lock className="text-brand" size={40} />
                    </div>

                    <div className="space-y-3">
                        <h1 className="font-bold text-foreground text-3xl tracking-tight">Área Restrita</h1>
                        <p className="text-neutral leading-relaxed">
                            Você está acessando o portal administrativo da Luz Esperança.
                            Para gerenciar agendamentos, tratamentos e comunicações, por favor, realize o login.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Link
                            href="/admin/login"
                            className="gap-2 bg-brand hover:bg-brand-hover disabled:bg-neutral border-brand hover:border-brand-hover disabled:border-neutral w-full text-background disabled:text-background/70 btn"
                        >
                            <LogIn size={20} />
                            Ir para o Login
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
