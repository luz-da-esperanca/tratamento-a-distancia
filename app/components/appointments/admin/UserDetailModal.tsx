import { useState } from "react";
import {
  X, Calendar, User, Trash2, Save, MoveRight,
  Mail, Phone, MessageCircle, HeartHandshake, CheckCircle2, XCircle
} from "lucide-react";
import { addMonths, format as formatDateFns } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateSafe, parseDateOnly, toDateOnlyISO } from "@/src/shared/utils/date";
import { Agendamento, OpcaoWhatsApp, StatusAgendamento } from "@/types/database";
import { SubmitButton } from "@/components/shared/SubmitButton";
// Importações das Server Actions reais:
import { atualizarAgendamento, excluirAgendamento } from "@/src/features/appointments/presentation/actions/agendamentos.actions";
import { calcularUltimaSextaDoMes } from "@/src/features/appointments/domain/services/SchedulingService";

interface UserDetailModalProps {
  agendamento: Agendamento;
  onClose: () => void;
  onUpdate: (protocolo: string, data: Partial<Agendamento>) => void;
  onDelete: (protocolo: string) => void;
}

export function UserDetailModal({ agendamento, onClose, onUpdate, onDelete }: UserDetailModalProps) {
  const isSurgery = agendamento.tipo === "TRATAMENTO_COM_CIRURGIA";
  // Remontado por key={protocolo} em TratamentoCirurgia: o estado inicial
  // já reflete o registro aberto, sem sincronização via efeito.
  const [tipoWhats, setTipoWhats] = useState<OpcaoWhatsApp>(agendamento.tipo_whatsapp);

  const handleReschedule = async () => {
    if (isSurgery && agendamento.data_cirurgia) {
      const base =
        agendamento.data_cirurgia instanceof Date
          ? agendamento.data_cirurgia
          : parseDateOnly(String(agendamento.data_cirurgia));
      const nextMonth = addMonths(base, 1);
      const newDate = calcularUltimaSextaDoMes(nextMonth);

      // Salva direto no banco
      const resultado = await atualizarAgendamento(agendamento.protocolo, { data_cirurgia: toDateOnlyISO(newDate) } as unknown as Partial<Agendamento>);

      if (!resultado.sucesso) {
        alert(resultado.erro ?? 'Não foi possível adiar o agendamento.');
        return;
      }

      // Atualiza o estado local para a UI responder na hora
      onUpdate(agendamento.protocolo, { data_cirurgia: newDate } as unknown as Partial<Agendamento>);
    }
  };

  const handleFormAction = async (formData: FormData) => {
    // Extrai os dados
    const dataToUpdate: Partial<Agendamento> = {
      email_notificacao: formData.get("emailNotificacao") as string,
      celular: formData.get("celular") as string,
      tipo_whatsapp: formData.get("tipoWhatsApp") as OpcaoWhatsApp,
      whatsapp_auxiliar: tipoWhats === "OUTRO_NUMERO" ? (formData.get("whatsappAuxiliar") as string) : "",
      nome_solicitante: formData.get("nomeSolicitante") as string,
      eh_intercessorio: formData.get("ehIntercessorio") === "true",
      status: formData.get("status") as StatusAgendamento,
    };

    // 1. Chama a Server Action para persistir no Supabase
    const resultado = await atualizarAgendamento(agendamento.protocolo, {
      email_notificacao: dataToUpdate.email_notificacao,
      celular: dataToUpdate.celular,
      tipo_whatsapp: dataToUpdate.tipo_whatsapp,
      whatsapp_auxiliar: dataToUpdate.whatsapp_auxiliar,
      nome_solicitante: dataToUpdate.nome_solicitante,
      eh_intercessorio: dataToUpdate.eh_intercessorio,
      status: dataToUpdate.status
    } as unknown as Partial<Agendamento>);

    if (!resultado.sucesso) {
      alert(resultado.erro ?? 'Não foi possível salvar as alterações.');
      return;
    }

    // 2. Atualiza a grid principal e fecha o modal
    onUpdate(agendamento.protocolo, dataToUpdate);
    onClose();
  };

  const handleDeleteClick = async () => {
    if (confirm("Tem certeza que deseja excluir este agendamento permanentemente?")) {
      // Deleta do Supabase
      const resultado = await excluirAgendamento(agendamento.protocolo, agendamento.paciente_id);

      if (!resultado.sucesso) {
        alert(resultado.erro ?? 'Não foi possível excluir o agendamento.');
        return;
      }

      // Remove da grid
      onDelete(agendamento.protocolo);
      onClose();
    }
  };

  return (
    <div className=" modal modal-open  sm:modal-middle">
      <div className="bg-card p-0 border border-neutral/15 sm:rounded-3xl rounded-t-3xl max-w-4xl overflow-hidden modal-box">

        <div className="flex justify-between items-center bg-background/50 p-6 border-neutral/10 border-b">
          <div className="flex items-center gap-4 text-brand">
            <div className="bg-brand/10 p-3 rounded-2xl">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-xl leading-tight">Detalhes do Agendamento</h3>
              <p className="mt-0.5 font-medium text-neutral text-sm uppercase tracking-wider">Prot: {agendamento.protocolo}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-neutral/10 text-neutral btn btn-ghost btn-circle btn-sm">
            <X size={20} />
          </button>
        </div>

        <form action={handleFormAction} className="flex flex-col max-h-[75vh]">
          {/* ... Todo o miolo do formulário permanece intocado ... */}
          <div className="space-y-8 p-6 sm:p-8 overflow-y-auto grow">

            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-bold text-brand text-xs uppercase tracking-widest">
                <User size={14} /> Dados do Paciente
              </h4>
              <div className="gap-4 grid sm:grid-cols-2 bg-background p-5 border border-neutral/15 rounded-3xl">
                <label className="form-control">
                  <span className="flex items-center gap-1.5 mb-2 font-medium text-foreground label-text">Nome Completo</span>
                  <input type="text" className="bg-neutral/5 border-neutral/20 text-neutral input input-bordered" value={agendamento.pacientes.nome_completo} readOnly />
                </label>
                <label className="form-control">
                  <span className="flex items-center gap-1.5 mb-2 font-medium text-foreground label-text">Data de Nascimento</span>
                  <input type="text" className="bg-neutral/5 border-neutral/20 text-neutral input input-bordered" value={formatDateSafe(agendamento.pacientes?.data_nascimento)} readOnly />
                </label>
                <label className="form-control">
                  <span className="flex items-center gap-1.5 mb-2 font-medium text-foreground label-text">Endereço Completo</span>
                  <input type="text" className="bg-neutral/5 border-neutral/20 text-neutral input input-bordered" value={`${agendamento.pacientes.endereco}, ${agendamento.pacientes.cidade}/${agendamento.pacientes.estado} - ${agendamento.pacientes.pais}`} readOnly />
                </label>
              </div>
            </section>

            {/* SEÇÃO 1: Contato */}
            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-bold text-brand text-xs uppercase tracking-widest">
                <Phone size={14} /> Dados de Contato
              </h4>
              <div className="gap-4 grid sm:grid-cols-2 bg-background p-5 border border-neutral/15 rounded-3xl">
                <label className="form-control">
                  <span className="flex items-center gap-1.5 mb-2 font-medium text-foreground label-text"><Mail size={14} className="text-neutral" /> E-mail de Notificação</span>
                  <input
                    type="email"
                    name="emailNotificacao"
                    className="bg-card border-neutral/20 focus:border-brand text-foreground input input-bordered"
                    defaultValue={agendamento.email_notificacao}
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="flex items-center gap-1.5 mb-2 font-medium text-foreground label-text"><Phone size={14} className="text-neutral" /> Celular</span>
                  <input
                    type="tel"
                    name="celular"
                    className="bg-card border-neutral/20 focus:border-brand text-foreground input input-bordered"
                    defaultValue={agendamento.celular}
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="flex items-center gap-1.5 mb-2 font-medium text-foreground label-text"><MessageCircle size={14} className="text-neutral" /> Tipo de WhatsApp</span>
                  <select
                    name="tipoWhatsApp"
                    className="bg-card border-neutral/20 focus:border-brand text-foreground select-bordered select"
                    value={tipoWhats}
                    onChange={(e) => setTipoWhats(e.target.value as OpcaoWhatsApp)}
                  >
                    <option value="E_WHATSAPP">É o mesmo do celular</option>
                    <option value="OUTRO_NUMERO">Outro número</option>
                    <option value="NAO_TEM">Não possui WhatsApp</option>
                  </select>
                </label>

                {tipoWhats === "OUTRO_NUMERO" && (
                  <label className="form-control">
                    <span className="mb-2 font-medium text-foreground label-text">WhatsApp Auxiliar</span>
                    <input
                      type="tel"
                      name="whatsappAuxiliar"
                      className="bg-card border-neutral/20 focus:border-brand text-foreground input input-bordered"
                      defaultValue={agendamento.whatsapp_auxiliar}
                      required
                    />
                  </label>
                )}
              </div>
            </section>

            {/* SEÇÃO 2: Informações da Solicitação */}
            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-bold text-brand text-xs uppercase tracking-widest">
                <HeartHandshake size={14} /> Detalhes da Solicitação
              </h4>
              <div className="gap-6 grid sm:grid-cols-2 bg-background p-5 sm:p-6 border border-neutral/15 rounded-3xl">

                <label className="form-control">
                  <span className="mb-2 font-medium text-foreground label-text">Nome do Solicitante</span>
                  <input
                    type="text"
                    name="nomeSolicitante"
                    className="bg-card border-neutral/20 focus:border-brand text-foreground input input-bordered"
                    defaultValue={agendamento.nome_solicitante}
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="mb-2 font-medium text-foreground label-text">Finalidade (Intercessório?)</span>
                  <select
                    name="ehIntercessorio"
                    className="bg-card border-neutral/20 focus:border-brand text-foreground select-bordered select"
                    defaultValue={agendamento.eh_intercessorio ? "true" : "false"}
                  >
                    <option value="false">Para si mesmo</option>
                    <option value="true">Para terceiros (Intercessório)</option>
                  </select>
                </label>

                <div>
                  <p className="mb-2 font-bold text-neutral text-xs uppercase tracking-wide">Modalidade</p>
                  <div className={`badge font-medium py-3 px-3 ${isSurgery ? 'bg-brand/10 text-brand border-brand/20' : 'bg-neutral/10 text-neutral border-neutral/20'}`}>
                    {isSurgery ? "Com Cirurgia" : "Sem Cirurgia"}
                  </div>
                </div>

                {isSurgery && formatDateSafe(agendamento.data_cirurgia) !== "—" ? (
                  <div>
                    <p className="mb-2 font-bold text-neutral text-xs uppercase tracking-wide">Data da Cirurgia</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-foreground text-sm">
                        {(() => {
                          const raw = agendamento.data_cirurgia;
                          const base =
                            raw instanceof Date ? raw : parseDateOnly(String(raw));
                          return formatDateFns(base, "dd 'de' MMM, yyyy", { locale: ptBR });
                        })()}
                      </span>
                      <button
                        type="button"
                        onClick={handleReschedule}
                        className="gap-1.5 hover:bg-brand/10 border-brand/30 hover:border-brand rounded-lg btn-outline text-brand btn btn-xs"
                        title="Adiar em 1 mês"
                      >
                        Adiar <MoveRight size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  isSurgery && (
                    <div>
                      <p className="mb-2 font-bold text-neutral text-xs uppercase tracking-wide">Data da Cirurgia</p>
                      <span className="text-neutral text-sm">Data não definida</span>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* SEÇÃO 3: Status e Sistema */}
            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-bold text-brand text-xs uppercase tracking-widest">
                <Calendar size={14} /> Status e Sistema
              </h4>
              <div className="items-center gap-6 grid sm:grid-cols-2 bg-background p-5 sm:p-6 border border-neutral/15 rounded-3xl">

                <label className="form-control">
                  <span className="mb-2 font-medium text-foreground label-text">Status do Tratamento</span>
                  <select
                    name="status"
                    className="bg-card border-neutral/20 focus:border-brand w-full font-medium text-foreground select-bordered select"
                    defaultValue={agendamento.status}
                  >
                    <option value="AGENDADO">Agendado</option>
                    <option value="FINALIZADO">Finalizado</option>
                  </select>
                </label>

                <div className="space-y-3">
                  <p className="font-bold text-neutral text-xs uppercase tracking-wide">Disparos de Rotina</p>
                  <div className="flex flex-col gap-2 text-sm">
                    <span className="flex items-center gap-2 text-foreground/80">
                      {agendamento.enviou_email_terca
                        ? <CheckCircle2 size={16} className="text-brand" />
                        : <XCircle size={16} className="text-neutral/40" />
                      }
                      E-mail de Terça-feira
                    </span>
                    <span className="flex items-center gap-2 text-foreground/80">
                      {agendamento.enviou_email_quarta
                        ? <CheckCircle2 size={16} className="text-brand" />
                        : <XCircle size={16} className="text-neutral/40" />
                      }
                      E-mail de Quarta-feira
                    </span>
                  </div>
                </div>

              </div>
            </section>

          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 bg-background/50 mt-auto p-6 border-neutral/10 border-t">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="gap-2 hover:bg-error/10 px-4 rounded-xl text-error btn btn-ghost btn-sm"
            >
              <Trash2 size={16} /> Excluir
            </button>
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="hover:bg-neutral/10 border-neutral/20 rounded-xl text-foreground btn btn-ghost">Cancelar</button>

              <SubmitButton
                text="Salvar Alterações"
                loadingText="Salvando..."
                icon={<Save size={18} />}
                className="bg-brand hover:bg-brand-hover shadow-md border-brand rounded-xl text-background"
              />
            </div>
          </div>
        </form>

      </div>
      <div className="bg-foreground/20 backdrop-blur-sm modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
