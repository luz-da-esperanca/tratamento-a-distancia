"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode, ButtonHTMLAttributes } from "react";

// Estendendo os atributos nativos para aceitar 'disabled', 'className', etc.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  loadingText?: string; // Texto opcional para o loading
  icon?: ReactNode;
}

export function SubmitButton({ 
  text, 
  loadingText = "Acessando...", 
  icon, 
  disabled, 
  className = "w-full", // Padrão original mantido
  ...props 
}: ButtonProps) { 
  const { pending } = useFormStatus();

  // O botão desativa se estiver carregando OU se a condição customizada barrar
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`gap-2 bg-brand hover:bg-brand-hover disabled:bg-neutral border-brand hover:border-brand-hover disabled:border-neutral text-background disabled:text-background/70 btn ${className}`}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon} 
          {text}
        </>
      )}
    </button>
  );
}