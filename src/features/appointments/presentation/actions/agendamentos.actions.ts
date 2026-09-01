"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Agendamento } from '@/types/database';
import type { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import type { Patient } from '@/src/features/patients/domain/entities/Patient';
import { makeListAppointmentsUseCase } from '@/src/shared/infrastructure/composition/container';
import { makeUpdateAppointmentUseCase } from '@/src/shared/infrastructure/composition/container';
import { makeDeleteAppointmentUseCase } from '@/src/shared/infrastructure/composition/container';
import { makeValidatePatientAccessUseCase } from '@/src/shared/infrastructure/composition/container';
import { makeGetAppointmentByProtocolUseCase } from '@/src/shared/infrastructure/composition/container';
import { toAppError } from '@/src/shared/domain/errors';

interface AppointmentItem {
  appointment: Appointment;
  paciente: Patient | null;
}

function toLegacyAgendamento(item: AppointmentItem): Agendamento {
  const { appointment, paciente } = item;

  const base = {
    protocolo: appointment.protocolo.valor,
    paciente_id: appointment.pacienteId,
    data_cadastro: appointment.dataCadastro,
    status: appointment.status,
    email_notificacao: appointment.emailNotificacao,
    celular: appointment.celular,
    tipo_whatsapp: appointment.tipoWhatsapp,
    whatsapp_auxiliar: appointment.whatsappAuxiliar,
    eh_intercessorio: appointment.ehIntercessorio,
    nome_solicitante: appointment.nomeSolicitante,
    enviou_email_terca: appointment.enviouEmailTerca,
    enviou_email_quarta: appointment.enviouEmailQuarta,
    pacientes: paciente
      ? {
          nome_completo: paciente.nomeCompleto,
          data_nascimento: paciente.dataNascimento,
          pais: paciente.pais,
          estado: paciente.estado,
          cidade: paciente.cidade,
          endereco: paciente.endereco,
        }
      : null,
  };

  if (appointment.tipo === 'TRATAMENTO_COM_CIRURGIA') {
    return {
      ...base,
      tipo: 'TRATAMENTO_COM_CIRURGIA',
      data_cirurgia: appointment.dataCirurgia ?? null,
    } as unknown as Agendamento;
  }

  return { ...base, tipo: 'TRATAMENTO_SEM_CIRURGIA' } as unknown as Agendamento;
}

export async function buscarAgendamentos(): Promise<Agendamento[]> {
  try {
    const useCase = await makeListAppointmentsUseCase();
    const { itens } = await useCase.execute();
    return itens.map(toLegacyAgendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }
}

export async function atualizarAgendamento(
  protocolo: string,
  dados: Partial<Agendamento>,
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const useCase = await makeUpdateAppointmentUseCase();

    await useCase.execute({
      protocolo,
      campos: {
        status: dados.status,
        emailNotificacao: dados.email_notificacao,
        celular: dados.celular,
        tipoWhatsapp: dados.tipo_whatsapp,
        whatsappAuxiliar: dados.whatsapp_auxiliar,
        ehIntercessorio: dados.eh_intercessorio,
        nomeSolicitante: dados.nome_solicitante,
        dataCirurgia: (dados as { data_cirurgia?: Date }).data_cirurgia ?? undefined,
      },
    });

    revalidatePath('/admin/painel');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return { sucesso: false, erro: toAppError(error).message };
  }
}

export async function excluirAgendamento(
  protocolo: string,
  pacienteId: string,
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const useCase = await makeDeleteAppointmentUseCase();
    await useCase.execute({ protocolo, pacienteId });
    revalidatePath('/admin/painel');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return { sucesso: false, erro: toAppError(error).message };
  }
}

export async function validarAcessoPaciente(prevState: { erro?: string } | null, formData: FormData) {
  const protocolo = formData.get('protocolo') as string;
  const dataNascimento = formData.get('dataNascimento') as string;

  if (!protocolo || !dataNascimento) {
    return { erro: 'Por favor, preencha todos os campos.' };
  }

  try {
    const useCase = await makeValidatePatientAccessUseCase();
    await useCase.execute({ protocolo, dataNascimento });
  } catch {
    return { erro: 'Protocolo ou data de nascimento inválidos.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('paciente_session', protocolo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 2,
    path: '/',
  });

  redirect(`/tratamento/${protocolo}`);
}

export async function buscarAgendamentoPorProtocolo(protocolo: string): Promise<Agendamento | null> {
  try {
    const useCase = await makeGetAppointmentByProtocolUseCase();
    const { appointment, paciente } = await useCase.execute({ protocolo });
    return toLegacyAgendamento({ appointment, paciente });
  } catch {
    return null;
  }
}
