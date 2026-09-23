"use server";

import { revalidatePath } from 'next/cache';
import { makeSaveEmailTemplatesUseCase } from '@/src/shared/infrastructure/composition/container';
import { toAppError } from '@/src/shared/domain/errors';
import { requireAdmin } from '@/src/shared/infrastructure/auth/requireAdmin';

export async function salvarTemplatesRotina(
  formData: FormData,
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    await requireAdmin();
    const tercaAssunto = formData.get('tercaAssunto') as string;
    const tercaCorpo = formData.get('tercaCorpo') as string;
    const quartaAssunto = formData.get('quartaAssunto') as string;
    const quartaCorpo = formData.get('quartaCorpo') as string;

    const useCase = await makeSaveEmailTemplatesUseCase();

    await useCase.execute({
      tercaAssunto,
      tercaCorpo,
      quartaAssunto,
      quartaCorpo,
    });

    revalidatePath('/admin/painel');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao salvar templates de e-mail:', error);
    return { sucesso: false, erro: toAppError(error).message };
  }
}
