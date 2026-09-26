import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationError } from '@/src/shared/domain/errors';

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-teste');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-teste');
vi.stubEnv('ADMIN_ALLOWED_EMAILS', 'admin@exemplo.com');

const getUser = vi.fn();

vi.mock('@/src/shared/infrastructure/database/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({ auth: { getUser } })),
}));

import { requireAdmin } from '@/src/shared/infrastructure/auth/requireAdmin';

describe('requireAdmin — gate único das admin actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna identidade para e-mail da allowlist', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: 'u-1', email: 'admin@exemplo.com' } } });

    const identity = await requireAdmin();

    expect(identity).toEqual({ userId: 'u-1', email: 'admin@exemplo.com' });
  });

  it('normaliza caixa alta e espaços do e-mail', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: 'u-1', email: '  Admin@Exemplo.com ' } } });

    const identity = await requireAdmin();

    expect(identity.userId).toBe('u-1');
  });

  it('rejeita sessão inexistente (fail-closed)', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });

    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('rejeita usuário sem e-mail', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: 'u-2', email: null } } });

    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('rejeita autenticado fora da allowlist (sem privilege escalation)', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: 'u-3', email: 'usuario@comum.com' } } });

    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('não vaza o motivo da negação (mensagem genérica)', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });

    const error = await requireAdmin().catch((e) => e);

    expect(error.message).toBe('Não autorizado.');
    expect(error.message).not.toContain('admin@exemplo.com');
  });
});
