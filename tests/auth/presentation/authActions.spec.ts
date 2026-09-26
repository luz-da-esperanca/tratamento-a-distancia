import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, failure } from '@/src/shared/domain/Result';
import { InvalidCredentialsError } from '@/src/features/auth/domain/errors/AuthErrors';

const loginExecute = vi.fn();
const logoutExecute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeLoginAdminUseCase: vi.fn(async () => ({ execute: loginExecute })),
  makeLogoutAdminUseCase: vi.fn(async () => ({ execute: logoutExecute })),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

import { loginAction, logoutAction } from '@/src/features/auth/presentation/actions/auth.actions';

function loginForm(login: string, senha: string): FormData {
  const fd = new FormData();
  fd.set('login', login);
  fd.set('senha', senha);
  return fd;
}

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('credencial inválida retorna erro amigável sem redirecionar', async () => {
    loginExecute.mockResolvedValueOnce(failure(new InvalidCredentialsError()));

    const result = await loginAction(null, loginForm('admin@exemplo.com', 'errada'));

    expect(loginExecute).toHaveBeenCalledWith({ email: 'admin@exemplo.com', password: 'errada' });
    expect(result).toEqual({ error: 'Credenciais inválidas. Verifique o login e a senha.' });
  });

  it('sucesso redireciona para /admin/painel', async () => {
    loginExecute.mockResolvedValueOnce(ok({ userId: 'u-1', email: 'admin@exemplo.com' }));

    const error = await loginAction(null, loginForm('admin@exemplo.com', 'certa')).catch((e) => e);

    expect(String(error)).toContain('NEXT_REDIRECT:/admin/painel');
  });

  it('erro inesperado retorna mensagem mapeada sem vazar detalhes', async () => {
    loginExecute.mockRejectedValueOnce(new Error('segredo xyz'));

    const result = await loginAction(null, loginForm('admin@exemplo.com', 'x'));

    expect(result?.error).not.toContain('segredo xyz');
    expect(typeof result?.error).toBe('string');
  });
});

describe('logoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('encerra a sessão e redireciona para /admin/login', async () => {
    logoutExecute.mockResolvedValueOnce(ok(undefined));

    const error = await logoutAction().catch((e) => e);

    expect(logoutExecute).toHaveBeenCalledOnce();
    expect(String(error)).toContain('NEXT_REDIRECT:/admin/login');
  });

  it('falha no gateway ainda redireciona (logout best-effort)', async () => {
    logoutExecute.mockRejectedValueOnce(new Error('falha no supabase'));

    const error = await logoutAction().catch((e) => e);

    expect(String(error)).toContain('NEXT_REDIRECT:/admin/login');
  });
});
