"use client";

import { useActionState } from "react";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { loginAction } from "@/src/features/auth/presentation/actions/auth.actions";

export default function LoginPage() {
  // O hook useActionState substitui o useTransition e gerencia o retorno (erros) da Server Action
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className="flex flex-col bg-brand min-h-screen text-foreground">
      <main className="flex justify-center items-center p-4 grow">
        <div className="bg-card shadow-sm p-8 border border-neutral/15 rounded-3xl w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center items-center bg-brand/10 mx-auto mb-4 rounded-2xl w-16 h-16">
              <Lock className="text-brand" size={32} />
            </div>
            <h1 className="font-bold text-2xl">Acesso Administrativo</h1>
            <p className="font-extralight text-brand text-sm">Entre com suas credenciais para gerenciar o sistema</p>
          </div>

          <form action={formAction} className="space-y-6 grid">
            
            {/* Exibição da mensagem de erro vinda do backend (Supabase) */}
            {state?.error && (
              <div className="flex items-center gap-2 bg-error/10 p-3 border border-error/20 rounded-xl text-error text-sm">
                <AlertCircle size={16} />
                {state.error}
              </div>
            )}

            <label className="form-control">
              <span className="flex items-center gap-2 mb-2 font-medium text-foreground text-sm label-text">
                <User size={16} />Usuário (E-mail)
              </span>
              <input
                type="email"
                name="login" // Atualizado para casar com a Action e com o padrão do Supabase
                placeholder="admin@email.com"
                className="bg-background border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-foreground/50 input input-bordered"
                required
              />
            </label>

            <label className="form-control">
              <span className="flex items-center gap-2 mb-2 font-medium text-foreground text-sm label-text">
                <Lock size={16} /> Senha
              </span>
              <input
                type="password"
                name="senha"
                placeholder="••••••••"
                className="bg-background border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-foreground/50 input input-bordered"
                required
              />
            </label>

            {/* O SubmitButton já usa useFormStatus internamente para mostrar o loading */}
            <SubmitButton text="Entrar no Painel" icon={<LogIn size={16} />} />
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}