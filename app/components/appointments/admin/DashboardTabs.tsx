"use client";

import { useState } from "react";
import { Calendar, Mail, Send } from "lucide-react";
import TratamentoCirurgia from "./TratamentoCirurgia";
import EmailsProgramados from "./EmailsProgramados";
import EnviarAlerta from "./EnviarAlerta";
import { Agendamento } from "@/types/database";

export function DashboardTabs({ agendamentos }: { agendamentos: Agendamento[] }) {
  const [activeTab, setActiveTab] = useState(0);

  // Classe base compartilhada para abas
  const tabClass = `tab tab-lifted font-medium text-lg transition-all duration-300 `;
  const activeTabClass = `tab-active !text-brand !border-neutral/20 !bg-card font-bold`;
  const inactiveTabClass = `text-neutral/70 hover:text-brand hover:bg-brand/5 border-transparent`;

  return (
    <div role="tablist" className="w-full tabs tabs-lifted tabs-lg">
      
      {/* Aba 1 */}
      <button 
        role="tab" 
        onClick={() => setActiveTab(0)} 
        className={`${tabClass} ${activeTab === 0 ? activeTabClass : inactiveTabClass}`}
      >
        <Calendar size={18} className="mr-2" /> Tratamento/Cirurgia
      </button>
      <div role="tabpanel" className={`bg-card p-6 border border-neutral/20 rounded-b-2xl rounded-tr-2xl tab-content ${activeTab === 0 ? "block" : "hidden"}`}>
        <TratamentoCirurgia dadosIniciais={agendamentos} />
      </div>

      {/* Aba 2 */}
      <button 
        role="tab" 
        onClick={() => setActiveTab(1)} 
        className={`${tabClass} ${activeTab === 1 ? activeTabClass : inactiveTabClass}`}
      >
        <Mail size={18} className="mr-2" /> E-mails Programados
      </button>
      <div role="tabpanel" className={`bg-card p-6 border border-neutral/20 rounded-b-2xl rounded-tr-2xl tab-content ${activeTab === 1 ? "block" : "hidden"}`}>
        <EmailsProgramados />
      </div>

      {/* Aba 3 */}
      <button 
        role="tab" 
        onClick={() => setActiveTab(2)} 
        className={`${tabClass} ${activeTab === 2 ? activeTabClass : inactiveTabClass}`}
      >
        <Send size={18} className="mr-2" /> Enviar Alerta
      </button>
      <div role="tabpanel" className={`bg-card p-6 border border-neutral/20 rounded-b-2xl rounded-tr-2xl tab-content ${activeTab === 2 ? "block" : "hidden"}`}>
        <EnviarAlerta agendamentosRecentes={agendamentos} />
      </div>
    </div>
  );
}