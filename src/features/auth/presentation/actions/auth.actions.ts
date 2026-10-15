"use server";

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { makeLoginAdminUseCase, makeLogoutAdminUseCase, makeRateLimiter } from '@/src/shared/infrastructure/composition/container';
import { enforceRateLimit } from '@/src/shared/infrastructure/ratelimit/enforceRateLimit';
import { getClientIp } from '@/src/shared/infrastructure/ratelimit/clientIp';
import { RATE_LIMITS } from '@/src/shared/infrastructure/ratelimit/rateLimitConfig';
import { toAppError } from '@/src/shared/domain/errors';

export async function loginAction(prevState: { error?: string } | null, formData: FormData) {
  const login = formData.get('login') as string;
  const senha = formData.get('senha') as string;

  try {
    const allowed = await enforceRateLimit(makeRateLimiter(), {
      ...RATE_LIMITS.loginAdmin,
      identifier: getClientIp(await headers()),
    });
    if (!allowed) {
      return { error: 'Muitas tentativas. Aguarde um minuto e tente novamente.' };
    }

    const useCase = await makeLoginAdminUseCase();
    const result = await useCase.execute({ email: login, password: senha });

    if (!result.ok) {
      return { error: 'Credenciais inválidas. Verifique o login e a senha.' };
    }
  } catch (error) {
    console.error('Erro no login administrativo:', error);
    return { error: toAppError(error).message };
  }

  redirect('/admin/painel');
}

export async function logoutAction() {
  try {
    const useCase = await makeLogoutAdminUseCase();
    await useCase.execute();
  } catch (error) {
    console.error('Erro no logout administrativo:', error);
  }

  redirect('/admin/login');
}
