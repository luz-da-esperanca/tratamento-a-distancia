import { describe, it, expect, vi } from 'vitest';

vi.stubEnv('PACIENTE_SESSION_SECRET', 'segredo-de-teste-com-32-chars-123456');

const validateExecute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeValidatePatientAccessUseCase: vi.fn(async () => ({ execute: validateExecute })),
  makeRateLimiter: vi.fn(() => ({ check: vi.fn(async () => ({ allowed: false })) })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: vi.fn() })),
  headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '9.9.9.9' })),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

import { validarAcessoPaciente } from '@/src/features/appointments/presentation/actions/agendamentos.actions';

describe('validarAcessoPaciente — throttle', () => {
  it('estourado o limite retorna erro formatado sem alcançar o use-case', async () => {
    const form = new FormData();
    form.set('protocolo', 'AGD-2026-1111');
    form.set('dataNascimento', '10/05/2000');

    const result = await validarAcessoPaciente(null, form);

    expect(result).toEqual({ erro: 'Muitas tentativas. Aguarde um minuto e tente novamente.' });
    expect(validateExecute).not.toHaveBeenCalled();
  });
});
