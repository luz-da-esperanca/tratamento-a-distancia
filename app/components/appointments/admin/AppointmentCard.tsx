import { User, Clock, Calendar, ArrowRight } from "lucide-react";
import { formatDateSafe } from "@/src/shared/utils/date";
import { Agendamento } from "@/types/database";

interface AppointmentCardProps {
  data: Agendamento;
  onClick: () => void;
}

export function AppointmentCard({ data, onClick }: AppointmentCardProps) {
  const cadastroLabel = formatDateSafe(data.data_cadastro);
  const cirurgiaLabel = formatDateSafe(
    (data as { data_cirurgia?: Date | string | null }).data_cirurgia ?? null,
  );
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-card hover:shadow-brand/5 hover:shadow-xl p-5 sm:p-6 border border-neutral/15 hover:border-brand/40 rounded-3xl h-full overflow-hidden transition-all cursor-pointer"
    >
      {/* Faixa lateral indicadora de cirurgia */}
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${data.tipo === "TRATAMENTO_COM_CIRURGIA" ? "bg-brand" : "bg-neutral/30"}`} />

      <div className="flex justify-between items-start mb-4 pl-2">
        <div className="bg-brand/10 p-2.5 rounded-xl text-brand">
          <User size={20} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${data.status === "AGENDADO" ? "bg-info/10 text-info" : "bg-success/10 text-success"}`}>
          {data.status}
        </span>
      </div>

      <div className="pl-2 grow">
        <h3 className="mb-1 font-bold text-foreground text-lg">{data.protocolo}</h3>
        <p className="text-neutral text-sm truncate" title={data.pacientes.nome_completo}>
          {data.pacientes.nome_completo}
        </p>
        <p className="mb-5 text-neutral text-sm truncate" title={data.email_notificacao}>
          {data.email_notificacao}
        </p>

        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2 font-medium text-foreground/70 text-xs">
            <Clock size={14} className="text-neutral" />
            Cadastro: {cadastroLabel === "—" ? "Data inválida" : cadastroLabel}
          </div>
          {data.tipo === "TRATAMENTO_COM_CIRURGIA" && cirurgiaLabel !== "—" && (
            <div className="flex items-center gap-2 font-bold text-brand text-xs">
              <Calendar size={14} />
              Cirurgia: {cirurgiaLabel}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto pt-4 pl-2 border-neutral/10 border-t">
        <span className="font-medium text-neutral group-hover:text-brand text-xs transition-colors">Ver detalhes</span>
        <div className="bg-background group-hover:bg-brand/10 p-1.5 rounded-full transition-colors">
          <ArrowRight size={16} className="text-neutral/40 group-hover:text-brand transition-all group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}