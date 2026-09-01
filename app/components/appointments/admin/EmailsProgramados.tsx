"use client";

import { useState } from "react";
import { Mail, Save, Info } from "lucide-react";
import { SubmitButton } from "@/components/shared/SubmitButton"; 
// Importe a Server Action
import { salvarTemplatesRotina } from "@/src/features/emails/presentation/actions/templates.actions";

export default function EmailsProgramados() {
  const [emailTerca, setEmailTerca] = useState({ titulo: "", corpo: "" });
  const [emailQuarta, setEmailQuarta] = useState({ titulo: "", corpo: "" });

  const handleAction = async (formData: FormData) => {
    // 1. O FormData pegará os inputs nomeados (adicionados abaixo)
    const resultado = await salvarTemplatesRotina(formData);

    if (!resultado.sucesso) {
      alert(resultado.erro ?? 'Não foi possível salvar as configurações de e-mail.');
      return;
    }

    // 2. Opcional: Você pode limpar ou mostrar uma notificação de sucesso aqui
    alert("Configurações de e-mail atualizadas com sucesso!");
  };

  const isFormIncomplete = 
    !emailTerca.titulo.trim() || 
    !emailTerca.corpo.trim() || 
    !emailQuarta.titulo.trim() || 
    !emailQuarta.corpo.trim();

  return (
    <form action={handleAction} className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center bg-card shadow-sm p-4 sm:p-5 border border-neutral/15 rounded-2xl">
        <div className="flex items-center gap-3 text-brand">
          <div className="bg-brand/10 p-2 rounded-xl">
            <Mail size={20} />
          </div>
          <h2 className="font-bold text-foreground text-xl sm:text-2xl">Configuração de E-mails de Rotina</h2>
        </div>
      </div>

      <div className="items-start gap-6 lg:gap-8 grid lg:grid-cols-2">
        
        {/* Card: E-mail de Terça-feira */}
        <div className="flex flex-col bg-card shadow-sm p-5 sm:p-6 border border-neutral/15 rounded-3xl h-full">
          <div className="flex items-center gap-2 mb-6 pb-4 border-neutral/10 border-b text-neutral">
            <Mail size={20} className="text-brand" />
            <h3 className="font-bold text-foreground text-base uppercase tracking-wider">E-mail de Terça-feira</h3>
          </div>
          
          <div className="flex flex-col space-y-5 grow">
            <label className="flex flex-col form-control">
              <span className="mb-2 font-bold text-foreground text-sm label-text">Título (Assunto)</span>
              <input 
                type="text" 
                name="tercaAssunto" // Necessário para a Server Action
                placeholder="Ex.: Orientações para a Palestra de Hoje..."
                className="bg-background pl-4 border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-neutral/40 transition-all input input-bordered"
                value={emailTerca.titulo}
                onChange={(e) => setEmailTerca({ ...emailTerca, titulo: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col grow form-control">
              <span className="mb-2 font-bold text-foreground text-sm label-text">Corpo da Mensagem</span>
              <textarea 
                name="tercaCorpo" // Necessário para a Server Action
                className="bg-background shadow-inner border-neutral/20 focus:border-brand w-full min-h-62 text-foreground placeholder:text-neutral/40 text-base leading-relaxed resize-none grow textarea textarea-bordered" 
                placeholder="Digite o conteúdo da mensagem que será enviada automaticamente todas as terças-feiras..."
                value={emailTerca.corpo}
                onChange={(e) => setEmailTerca({ ...emailTerca, corpo: e.target.value })}
                required
              ></textarea>
            </label>
          </div>
        </div>

        {/* Card: E-mail de Quarta-feira */}
        <div className="flex flex-col bg-card shadow-sm p-5 sm:p-6 border border-neutral/15 rounded-3xl h-full">
          <div className="flex items-center gap-2 mb-6 pb-4 border-neutral/10 border-b text-neutral">
            <Mail size={20} className="text-brand" />
            <h3 className="font-bold text-foreground text-base uppercase tracking-wider">E-mail de Quarta-feira</h3>
          </div>
          
          <div className="flex flex-col space-y-5 grow">
            <label className="flex flex-col form-control">
              <span className="mb-2 font-bold text-foreground text-sm label-text">Título (Assunto)</span>
              <input 
                type="text" 
                name="quartaAssunto" // Necessário para a Server Action
                placeholder="Ex.: Preparação para o Tratamento Espiritual..."
                className="bg-background pl-4 border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-neutral/40 transition-all input input-bordered"
                value={emailQuarta.titulo}
                onChange={(e) => setEmailQuarta({ ...emailQuarta, titulo: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col grow form-control">
              <span className="mb-2 font-bold text-foreground text-sm label-text">Corpo da Mensagem</span>
              <textarea 
                name="quartaCorpo" // Necessário para a Server Action
                className="bg-background shadow-inner border-neutral/20 focus:border-brand w-full min-h-62 text-foreground placeholder:text-neutral/40 text-base leading-relaxed resize-none grow textarea textarea-bordered" 
                placeholder="Digite o conteúdo da mensagem que será enviada automaticamente todas as quartas-feiras..."
                value={emailQuarta.corpo}
                onChange={(e) => setEmailQuarta({ ...emailQuarta, corpo: e.target.value })}
                required
              ></textarea>
            </label>
          </div>
        </div>

      </div>

      <div className="flex flex-col justify-between items-center gap-6 mt-4 pt-4 border-neutral/10 border-t">
        <div className="flex items-start gap-3 bg-neutral/5 p-4 border border-neutral/15 rounded-2xl w-full">
          <Info size={20} className="mt-0.5 text-neutral shrink-0" />
          <p className="text-foreground/80 text-sm leading-relaxed">
            As alterações feitas aqui refletirão no envio automático programado pelo sistema. Certifique-se de revisar o texto antes de salvar.
          </p>
        </div>

        <div className="flex justify-end w-full">
          <SubmitButton 
            text="Salvar Configurações"
            loadingText="Salvando..."
            icon={<Save size={20} />}
            disabled={isFormIncomplete}
            className="bg-brand hover:bg-brand-hover disabled:bg-neutral shadow-brand/20 shadow-lg disabled:shadow-none px-8 border-brand hover:border-brand-hover disabled:border-neutral rounded-2xl w-full md:w-auto text-background disabled:text-background/70 transition-all btn-lg"
          />
        </div>
      </div>
    </form>
  );
}