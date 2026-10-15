import { describe, it, expect, vi } from 'vitest';

const loginExecute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeLoginAdminUseCase: vi.fn(async () => ({ execute: loginExecute })),
  makeRateLimiter: vi.fn(() => ({ check: vi.fn(async () => ({ allowed: false })) })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '9.9.9.9' })),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

import { loginAction } from '@/src/features/auth/presentation/actions/auth.actions';

describe('loginAction — throttle', () => {
  it('estourado o limite retorna erro formatado sem alcançar o use-case', async () => {
    const form = new FormData();
    form.set('login', 'admin@exemplo.com');
    form.set('senha', 'segredo');

    const result = await loginAction(null, form);

    expect(result).toEqual({ error: 'Muitas tentativas. Aguarde um minuto e tente novamente.' });
    expect(loginExecute).not.toHaveBeenCalled();
  });
});
