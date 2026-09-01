"use server";

import { makeSendSpecificAlertUseCase } from '@/src/shared/infrastructure/composition/container';
import { toAppError } from '@/src/shared/domain/errors';

export async function enviarAlertaGeral(
  protocolos: string[],
  assunto: string,
  mensagem: string,
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const useCase = await makeSendSpecificAlertUseCase();
    await useCase.execute({ protocolos, assunto, mensagem });
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao enviar alerta geral:', error);
    return { sucesso: false, erro: toAppError(error).message };
  }
}
