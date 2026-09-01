"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Agendamento } from "@/types/database";
import { AppointmentCard } from "./AppointmentCard";
import { UserDetailModal } from "./UserDetailModal";

// Adicionamos a interface para receber os dados do servidor
interface TratamentoCirurgiaProps {
  dadosIniciais: Agendamento[];
}

export default function TratamentoCirurgia({ dadosIniciais }: TratamentoCirurgiaProps) {
  // Inicializa o estado com os dados vindos do banco
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(dadosIniciais);
  const [filter, setFilter] = useState<"TODOS" | "TRATAMENTO_COM_CIRURGIA" | "TRATAMENTO_SEM_CIRURGIA">("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  const filteredData = agendamentos.filter(a => {
    const matchesFilter = filter === "TODOS" || a.tipo === filter;
    const matchesSearch = a.protocolo.includes(searchTerm) || a.email_notificacao.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdate = (protocolo: string, data: Partial<Agendamento>) => {
    setAgendamentos(prev => prev.map(a => a.protocolo === protocolo ? { ...a, ...data } as Agendamento : a));
    setSelectedAgendamento(null);
  };

  const handleDelete = (protocolo: string) => {
    setAgendamentos(prev => prev.filter(a => a.protocolo !== protocolo));
    setSelectedAgendamento(null);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Busca e Filtros - Mantido exatamente como estava */}
      <div className="flex lg:flex-row flex-col justify-between items-center gap-4 bg-card shadow-sm p-4 sm:p-5 border border-neutral/15 rounded-3xl">
        <div className="group relative w-full lg:max-w-md">
          <Search className="top-1/2 left-4 absolute text-neutral/40 group-focus-within:text-brand transition-colors -translate-y-1/2" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por protocolo ou e-mail..." 
            className="bg-background pl-11 border-neutral/20 focus:border-brand rounded-2xl w-full text-foreground placeholder:text-neutral/40 transition-all input input-bordered"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 bg-background p-1.5 border border-neutral/15 rounded-2xl w-full lg:w-auto">
          <button 
            onClick={() => setFilter("TODOS")}
            className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === "TODOS" ? "bg-brand text-background shadow-md" : "text-neutral/70 hover:text-brand hover:bg-brand/5"}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter("TRATAMENTO_COM_CIRURGIA")}
            className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === "TRATAMENTO_COM_CIRURGIA" ? "bg-brand text-background shadow-md" : "text-neutral/70 hover:text-brand hover:bg-brand/5"}`}
          >
            Com Cirurgia
          </button>
          <button 
            onClick={() => setFilter("TRATAMENTO_SEM_CIRURGIA")}
            className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === "TRATAMENTO_SEM_CIRURGIA" ? "bg-brand text-background shadow-md" : "text-neutral/70 hover:text-brand hover:bg-brand/5"}`}
          >
            Sem Cirurgia
          </button>
        </div>
      </div>

      {/* Grid de Agendamentos - Mantido exatamente como estava */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredData.map((agendamento) => (
          <AppointmentCard 
            key={agendamento.protocolo}
            data={agendamento}
            onClick={() => setSelectedAgendamento(agendamento)}
          />
        ))}

        {filteredData.length === 0 && (
          <div className="flex flex-col justify-center items-center space-y-4 col-span-full bg-card/50 py-24 border border-neutral/10 border-dashed rounded-3xl text-center">
            <div className="flex justify-center items-center bg-neutral/5 rounded-2xl w-20 h-20 text-neutral/40">
              <Filter size={32} />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">Nenhum agendamento encontrado.</p>
              <p className="mt-1 text-neutral text-sm">Tente ajustar seus termos de busca ou filtros de cirurgia.</p>
            </div>
            {(searchTerm || filter !== "TODOS") && (
              <button 
                onClick={() => { setSearchTerm(""); setFilter("TODOS"); }}
                className="mt-2 font-medium text-brand hover:underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalhes - Mantido exatamente como estava */}
      {selectedAgendamento && (
        <UserDetailModal 
          agendamento={selectedAgendamento} 
          onClose={() => setSelectedAgendamento(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}