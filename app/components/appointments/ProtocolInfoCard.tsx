import { Agendamento } from "@/types/database";
import { formatDateSafe } from "@/src/shared/utils/date";
import { User, Phone, Mail, ClipboardCheck, Info, HeartPulse, MessageCircle } from "lucide-react";

export function ProtocolInfoCard({ agendamento }: { agendamento: Agendamento }) {  
  return (
    <div className="bg-background shadow-xl border border-neutral/15 w-full card">
      <div className="p-6 sm:p-8 card-body">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-neutral/10 border-b">
          <div>
            <div className="flex items-center gap-2 mb-1 text-brand text-xs uppercase tracking-widest">
              <ClipboardCheck size={14} />
              Acompanhamento de Protocolo
            </div>
            <h2 className="font-semibold text-foreground text-3xl">{agendamento.protocolo}</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`badge ${agendamento.status === 'AGENDADO' ? 'badge-info' : 'badge-success'} badge-lg border-brand/20 text-brand bg-brand/5`}>
              {agendamento.status}
            </span>
            <span className="text-foreground/60 text-xs">Tipo: {agendamento.tipo === 'TRATAMENTO_COM_CIRURGIA' ? 'Com Cirurgia' : 'Sem Cirurgia'}</span>
          </div>
        </div>

        <div className="gap-8 grid grid-cols-1 lg:grid-cols-2">
          {/* Seção Paciente */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 pb-2 border-neutral/5 border-b font-semibold text-neutral text-lg">
              <User size={18} />
              Informações do Paciente
            </h3>
            <div className="gap-3 grid grid-cols-1 text-sm">
              <div className="flex justify-between py-1 border-neutral/5 border-b">
                <span className="text-foreground/60">Nome Completo:</span>
                <span className="font-medium text-foreground">{agendamento.pacientes.nome_completo}</span>
              </div>
              <div className="flex justify-between py-1 border-neutral/5 border-b">
                <span className="text-foreground/60">Data de Nascimento:</span>
                <span className="font-medium text-foreground">{formatDateSafe(agendamento.pacientes?.data_nascimento)}</span>
              </div>
              <div className="flex justify-between py-1 border-neutral/5 border-b">
                <span className="text-foreground/60">Localização:</span>
                <span className="font-medium text-foreground">{agendamento.pacientes.cidade}, {agendamento.pacientes.estado} / {agendamento.pacientes.pais}</span>
              </div>
              <div className="flex flex-col gap-1 py-1">
                <span className="text-foreground/60">Endereço:</span>
                <span className="font-medium text-foreground">{agendamento.pacientes.endereco}</span>
              </div>
            </div>

            <h3 className="flex items-center gap-2 mt-6 pb-2 border-neutral/5 border-b font-semibold text-neutral text-lg">
              <Phone size={18} />
              Contato de Notificação
            </h3>
            <div className="gap-3 grid grid-cols-1 text-sm">
              <div className="flex items-center gap-2 py-1">
                <Mail size={14} className="text-brand" />
                <span className="text-foreground/60">E-mail:</span>
                <span className="ml-auto font-medium text-foreground">{agendamento.email_notificacao}</span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <Phone size={14} className="text-brand" />
                <span className="text-foreground/60">Celular:</span>
                <span className="ml-auto font-medium text-foreground">{agendamento.celular}</span>
              </div>
              {agendamento.whatsapp_auxiliar && (
                <div className="flex items-center gap-2 py-1">
                  <MessageCircle className="text-brand" size={14} />
                  <span className="text-foreground/60">WhatsApp Auxiliar:</span>
                  <span className="ml-auto font-medium text-foreground">{agendamento.whatsapp_auxiliar}</span>
                </div>
              )}
              {!agendamento.whatsapp_auxiliar && (
                <div className="flex items-center gap-2 py-1">
                  <MessageCircle className="text-brand" size={14} />
                  <span className="text-foreground/60">Status WhatsApp:</span>
                  <span className="bg-neutral/5 ml-auto border-neutral/20 text-neutral badge badge-sm">{agendamento.tipo_whatsapp === 'E_WHATSAPP' ? 'Sim' : 'Não'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seção Agendamento e Contato */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 pb-2 border-neutral/5 border-b font-semibold text-neutral text-lg">
              <Info size={18} />
              Detalhes do Agendamento
            </h3>
            <div className="gap-3 grid grid-cols-1 text-sm">
              <div className="flex justify-between py-1 border-neutral/5 border-b">
                <span className="text-foreground/60">Solicitante:</span>
                <span className="font-medium text-foreground">{agendamento.nome_solicitante}</span>
              </div>
              <div className="flex justify-between py-1 border-neutral/5 border-b">
                <span className="text-foreground/60">Data do Cadastro:</span>
                <span className="font-medium text-foreground">{formatDateSafe(agendamento.data_cadastro)}</span>
              </div>
              <div className="flex justify-between py-1 border-neutral/5 border-b">
                <span className="text-foreground/60">Orientação Intercessória:</span>
                <span className="font-medium text-foreground">{agendamento.eh_intercessorio ? 'Sim' : 'Não'}</span>
              </div>
              {agendamento.tipo === 'TRATAMENTO_COM_CIRURGIA' && (
                <div className="flex justify-between bg-brand/5 px-2 py-1 border border-brand/10 rounded-md">
                  <span className="flex items-center gap-1 font-semibold text-brand">
                    <HeartPulse size={16} /> Data da Cirurgia:
                  </span>
                  <span className="font-bold text-brand">{formatDateSafe(agendamento.data_cirurgia)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
