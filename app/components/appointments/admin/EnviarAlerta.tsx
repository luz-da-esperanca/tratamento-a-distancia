"use client";

import { useState } from "react";
import { Send, Users, Search, CheckSquare, Square, Inbox, Type, Filter, HeartPulse, User } from "lucide-react";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { enviarAlertaGeral } from "@/src/features/appointments/presentation/actions/alertas.actions";
import { Agendamento } from "@/types/database";

interface EnviarAlertaProps {
  agendamentosRecentes: Agendamento[];
}

export default function EnviarAlerta({ agendamentosRecentes }: EnviarAlertaProps) {
  const [selectedProtocolos, setSelectedProtocolos] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [surgeryFilter, setSurgeryFilter] = useState<"ALL" | "COM_CIRURGIA" | "SEM_CIRURGIA">("ALL");

  const handleSelectAll = () => {
    if (selectedProtocolos.length === filteredAgendamentos.length && filteredAgendamentos.length > 0) {
      setSelectedProtocolos([]);
    } else {
      setSelectedProtocolos(filteredAgendamentos.map((a) => a.protocolo));
    }
  };

  // 1. NOVAS FUNÇÕES DE SELEÇÃO RÁPIDA
  const handleSelectWithSurgery = () => {
    const withSurgery = agendamentosRecentes
      .filter((a) => a.tipo === "TRATAMENTO_COM_CIRURGIA")
      .map((a) => a.protocolo);
    setSelectedProtocolos(withSurgery);
  };

  const handleSelectWithoutSurgery = () => {
    const withoutSurgery = agendamentosRecentes
      .filter((a) => a.tipo === "TRATAMENTO_SEM_CIRURGIA")
      .map((a) => a.protocolo);
    setSelectedProtocolos(withoutSurgery);
  };

  const toggleSelect = (protocolo: string) => {
    setSelectedProtocolos((prev) =>
      prev.includes(protocolo)
        ? prev.filter((p) => p !== protocolo)
        : [...prev, protocolo]
    );
  };

  const filteredAgendamentos = agendamentosRecentes.filter((a) => {
    const nomePaciente = a.pacientes?.nome_completo?.toLowerCase() || "";
    const protocolo = a.protocolo?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = nomePaciente.includes(search) || protocolo.includes(search);

    let matchesSurgery = true;
    if (surgeryFilter === "COM_CIRURGIA") {
      matchesSurgery = a.tipo === "TRATAMENTO_COM_CIRURGIA";
    } else if (surgeryFilter === "SEM_CIRURGIA") {
      matchesSurgery = a.tipo === "TRATAMENTO_SEM_CIRURGIA";
    }

    return matchesSearch && matchesSurgery;
  });

  const handleAction = async () => {
    const resultado = await enviarAlertaGeral(selectedProtocolos, subject, message);

    if (!resultado.sucesso) {
      alert(resultado.erro ?? 'Não foi possível enviar o alerta.');
      return;
    }

    alert(`Alerta enviado com sucesso para ${selectedProtocolos.length} pacientes!`);
    setSubject("");
    setMessage("");
    setSelectedProtocolos([]);
  };

  return (
    <form action={handleAction} className="space-y-6">
      <div className="flex justify-between items-center bg-card shadow-sm p-4 sm:p-5 border border-neutral/15 rounded-2xl">
        <div className="flex items-center gap-3 text-brand">
          <div className="bg-brand/10 p-2 rounded-xl">
            <Users size={20} />
          </div>
          <h2 className="font-bold text-foreground text-xl sm:text-2xl">Enviar Alerta Geral</h2>
        </div>
        <div className="bg-background px-4 py-3 sm:py-4 border-neutral/20 rounded-xl font-medium text-foreground/80 badge">
          <span className="mr-1 font-bold text-brand">{selectedProtocolos.length}</span> selecionado(s)
        </div>
      </div>

      <div className="items-start gap-6 lg:gap-8 grid lg:grid-cols-2">
        <div className="flex flex-col bg-card shadow-sm border border-neutral/15 rounded-3xl h-125 lg:h-162 overflow-hidden">
          <div className="space-y-4 bg-background/50 p-4 sm:p-5 border-neutral/10 border-b">
            <div className="group relative">
              <Search className="top-1/2 left-3 absolute text-neutral/50 group-focus-within:text-brand transition-colors -translate-y-1/2" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome ou protocolo..."
                className="bg-background pl-10 border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-neutral/50 transition-all input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="gap-2 hover:bg-brand/10 font-medium text-foreground/70 hover:text-brand btn btn-sm btn-ghost"
              >
                {selectedProtocolos.length === filteredAgendamentos.length && filteredAgendamentos.length > 0
                  ? <CheckSquare size={16} className="text-brand" />
                  : <Square size={16} />
                }
                Todos
              </button>
              
              {/* 2. BOTÕES DE SELEÇÃO RÁPIDA ADICIONADOS */}
              <div className="flex items-center gap-1 pl-2 border-neutral/15 border-l">
                <button
                  type="button"
                  onClick={handleSelectWithSurgery}
                  className="gap-1.5 hover:bg-brand/10 font-medium text-foreground/70 hover:text-brand btn btn-sm btn-ghost"
                  title="Marcar todos com cirurgia"
                >
                  <HeartPulse size={14} className="text-brand" />
                  <span className="hidden sm:inline">Com Cirurgia</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectWithoutSurgery}
                  className="gap-1.5 hover:bg-brand/10 font-medium text-foreground/70 hover:text-brand btn btn-sm btn-ghost"
                  title="Marcar todos sem cirurgia"
                >
                  <User size={14} className="text-neutral/50" />
                  <span className="hidden sm:inline">Sem Cirurgia</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto grow">
            {filteredAgendamentos.length > 0 ? (
              <table className="table table-pin-rows w-full">
                <tbody>
                  {filteredAgendamentos.map((agendamento) => (
                    <tr
                      key={agendamento.protocolo}
                      className={`hover:bg-neutral/5 cursor-pointer transition-colors border-b border-neutral/5 ${selectedProtocolos.includes(agendamento.protocolo) ? 'bg-brand/5' : ''}`}
                      onClick={() => toggleSelect(agendamento.protocolo)}
                    >
                      <td className="w-10">
                        <input
                          type="checkbox"
                          className="border-neutral/30 checkbox checkbox-accent checkbox-sm [--chkbg:var(--brand)] [--chkfg:var(--background)]"
                          checked={selectedProtocolos.includes(agendamento.protocolo)}
                          readOnly
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-2 font-bold text-foreground text-sm sm:text-base">
                          {agendamento.pacientes?.nome_completo ?? "Paciente não identificado"}
                          {agendamento.tipo === "TRATAMENTO_COM_CIRURGIA" && (
                            <span className="border-brand/20 badge-outline text-[10px] text-brand badge badge-xs">Cirurgia</span>
                          )}
                        </div>
                        <div className="font-medium text-neutral text-xs">Protocolo: {agendamento.protocolo}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col justify-center items-center space-y-3 p-6 h-full text-neutral text-center">
                <Inbox size={40} className="opacity-20" />
                <p>Nenhum paciente encontrado para os filtros aplicados.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col h-125 lg:h-162">
          <div className="flex flex-col space-y-4 bg-card shadow-sm p-5 sm:p-6 border border-neutral/15 rounded-3xl grow">
            <label className="flex flex-col form-control">
              <span className="mb-2 font-bold text-foreground text-sm label-text">Título (Assunto do E-mail)</span>
              <div className="relative">
                <Type size={16} className="top-1/2 left-3 absolute text-neutral/40 -translate-y-1/2" />
                <input
                  type="text"
                  name="subject" 
                  className="bg-background pl-9 border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-neutral/40 input input-bordered"
                  placeholder="Ex.: Orientações para a Cirurgia Espiritual"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="flex flex-col grow form-control">
              <span className="mb-2 font-bold text-foreground text-sm label-text">Mensagem do Alerta</span>
              <textarea
                name="message" 
                className="bg-background shadow-inner border-neutral/20 focus:border-brand w-full text-foreground placeholder:text-neutral/40 text-base leading-relaxed resize-none grow textarea textarea-bordered"
                placeholder="Digite aqui a mensagem que será enviada aos usuários selecionados..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </label>
          </div>
          <SubmitButton
            text={`Enviar para ${selectedProtocolos.length} Usuário(s)`}
            loadingText="Enviando..."
            icon={<Send size={20} />}
            disabled={selectedProtocolos.length === 0 || !subject.trim() || !message.trim()}
            className="shadow-brand/20 shadow-lg disabled:shadow-none mt-6 rounded-2xl w-full transition-all btn-lg"
          />
        </div>
      </div>
    </form>
  );
}