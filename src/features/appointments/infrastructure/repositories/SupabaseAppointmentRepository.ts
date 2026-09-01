import type { SupabaseClient } from '@supabase/supabase-js';
import { rethrowAsRepositoryError } from '@/src/shared/infrastructure/database/supabase/supabaseError';
import type { StatusAgendamento } from '../../domain/value-objects/StatusAgendamento';
import type { TipoTratamento } from '../../domain/entities/Appointment';
import { Appointment } from '../../domain/entities/Appointment';
import { Protocolo } from '../../domain/value-objects/Protocolo';
import type { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';

interface AgendamentoRow {
  protocolo: string;
  paciente_id: string;
  tipo: string;
  data_cadastro: string;
  status: string;
  email_notificacao: string;
  celular: string;
  tipo_whatsapp: string;
  whatsapp_auxiliar: string | null;
  eh_intercessorio: boolean;
  nome_solicitante: string;
  enviou_email_terca: boolean;
  enviou_email_quarta: boolean;
  data_cirurgia: string | null;
}

export class SupabaseAppointmentRepository implements AppointmentRepository {
  constructor(private readonly client: SupabaseClient) {}

  private toDomain(row: AgendamentoRow): Appointment {
    return Appointment.reconstituir({
      id: row.protocolo,
      protocolo: Protocolo.criar(row.protocolo),
      pacienteId: row.paciente_id,
      dataCadastro: new Date(row.data_cadastro),
      status: row.status as StatusAgendamento,
      emailNotificacao: row.email_notificacao,
      celular: row.celular,
      tipoWhatsapp: row.tipo_whatsapp,
      whatsappAuxiliar: row.whatsapp_auxiliar ?? undefined,
      ehIntercessorio: row.eh_intercessorio,
      nomeSolicitante: row.nome_solicitante,
      enviouEmailTerca: row.enviou_email_terca,
      enviouEmailQuarta: row.enviou_email_quarta,
      tipo: row.tipo as TipoTratamento,
      dataCirurgia: row.data_cirurgia ? new Date(row.data_cirurgia) : undefined,
    });
  }

  async save(appointment: Appointment): Promise<void> {
    const { error } = await this.client.from('agendamentos').insert({
      protocolo: appointment.protocolo.valor,
      paciente_id: appointment.pacienteId,
      tipo: appointment.tipo,
      data_cadastro: appointment.dataCadastro.toISOString(),
      status: appointment.status,
      email_notificacao: appointment.emailNotificacao,
      celular: appointment.celular,
      tipo_whatsapp: appointment.tipoWhatsapp,
      whatsapp_auxiliar: appointment.whatsappAuxiliar ?? null,
      eh_intercessorio: appointment.ehIntercessorio,
      nome_solicitante: appointment.nomeSolicitante,
      enviou_email_terca: appointment.enviouEmailTerca,
      enviou_email_quarta: appointment.enviouEmailQuarta,
      data_cirurgia: appointment.dataCirurgia
        ? appointment.dataCirurgia.toISOString().split('T')[0]
        : null,
    });

    if (error) {
      rethrowAsRepositoryError(error, 'Não foi possível salvar o agendamento.');
    }
  }

  async findByProtocol(protocolo: Protocolo): Promise<Appointment | null> {
    const { data, error } = await this.client
      .from('agendamentos')
      .select('*')
      .eq('protocolo', protocolo.valor)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.toDomain(data as AgendamentoRow);
  }

  async update(appointment: Appointment): Promise<void> {
    const { error } = await this.client
      .from('agendamentos')
      .update({
        status: appointment.status,
        email_notificacao: appointment.emailNotificacao,
        celular: appointment.celular,
        tipo_whatsapp: appointment.tipoWhatsapp,
        whatsapp_auxiliar: appointment.whatsappAuxiliar ?? null,
        eh_intercessorio: appointment.ehIntercessorio,
        nome_solicitante: appointment.nomeSolicitante,
        enviou_email_terca: appointment.enviouEmailTerca,
        enviou_email_quarta: appointment.enviouEmailQuarta,
        data_cirurgia: appointment.dataCirurgia
          ? appointment.dataCirurgia.toISOString().split('T')[0]
          : null,
      })
      .eq('protocolo', appointment.protocolo.valor);

    if (error) {
      rethrowAsRepositoryError(error, 'Não foi possível atualizar o agendamento.');
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('agendamentos').delete().eq('protocolo', id);

    if (error) {
      rethrowAsRepositoryError(error, 'Não foi possível excluir o agendamento.');
    }
  }

  async list(): Promise<Appointment[]> {
    const { data, error } = await this.client
      .from('agendamentos')
      .select('*')
      .order('data_cadastro', { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as AgendamentoRow[]).map((row) => this.toDomain(row));
  }

  async findPendingRoutine(tipo: 'terca' | 'quarta'): Promise<Appointment[]> {
    const flag = tipo === 'terca' ? 'enviou_email_terca' : 'enviou_email_quarta';

    const { data, error } = await this.client
      .from('agendamentos')
      .select('*')
      .eq('status', 'AGENDADO')
      .eq(flag, false);

    if (error || !data) {
      return [];
    }

    return (data as AgendamentoRow[]).map((row) => this.toDomain(row));
  }

  async findUpcomingSurgeryAlerts(_asOf: Date): Promise<Appointment[]> {
    const { data, error } = await this.client
      .from('agendamentos')
      .select('*')
      .eq('status', 'AGENDADO')
      .eq('tipo', 'TRATAMENTO_COM_CIRURGIA')
      .not('data_cirurgia', 'is', null);

    if (error || !data) {
      return [];
    }

    return (data as AgendamentoRow[]).map((row) => this.toDomain(row));
  }

  async resetRoutineFlags(): Promise<void> {
    const { error } = await this.client
      .from('agendamentos')
      .update({ enviou_email_terca: false, enviou_email_quarta: false })
      .eq('status', 'AGENDADO');

    if (error) {
      rethrowAsRepositoryError(error, 'Não foi possível resetar as flags de rotina.');
    }
  }
}
