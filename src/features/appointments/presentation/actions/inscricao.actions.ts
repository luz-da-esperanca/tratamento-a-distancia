"use server";

import { makeCreateAppointmentUseCase } from '@/src/shared/infrastructure/composition/container';
import { toAppError } from '@/src/shared/domain/errors';
import type { OpcaoWhatsApp } from '@/types/database';

export interface FormInscricao {
  nomeCompleto: string;
  dataNascimento: string;
  pais: string;
  estado: string;
  cidade: string;
  endereco: string;
  emailNotificacao: string;
  celular: string;
  tipoWhatsApp: OpcaoWhatsApp;
  whatsappAuxiliar?: string;
  nomeSolicitante: string;
  tipo: 'TRATAMENTO_COM_CIRURGIA' | 'TRATAMENTO_SEM_CIRURGIA';
}

export async function salvarAgendamento(dados: FormInscricao) {
  try {
    const useCase = await makeCreateAppointmentUseCase();

    const result = await useCase.execute({
      nomeCompleto: dados.nomeCompleto,
      dataNascimento: dados.dataNascimento,
      pais: dados.pais,
      estado: dados.estado,
      cidade: dados.cidade,
      endereco: dados.endereco,
      emailNotificacao: dados.emailNotificacao,
      celular: dados.celular,
      tipoWhatsApp: dados.tipoWhatsApp,
      whatsappAuxiliar: dados.whatsappAuxiliar,
      nomeSolicitante: dados.nomeSolicitante,
      tipo: dados.tipo,
    });

    return { sucesso: true, protocolo: result.protocolo, emailEnviado: result.emailEnviado };
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return { sucesso: false, erro: toAppError(error).message };
  }
}
