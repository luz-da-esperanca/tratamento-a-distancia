import { describe, it, expect, vi } from 'vitest';

vi.stubEnv('ADMIN_ALLOWED_EMAILS', 'admin@exemplo.com, Admin2@Exemplo.com');

import { isAdminEmail, getAdminEnv } from '@/src/shared/infrastructure/config/env';

describe('P0.1 ADMIN_ALLOWED_EMAILS fail-closed', () => {
  it('administrador allowlist é autorizado (case-insensitive)', () => {
    expect(isAdminEmail('admin@exemplo.com')).toBe(true);
    expect(isAdminEmail('ADMIN2@EXEMPLO.COM')).toBe(true);
  });

  it('usuário autenticado comum não é admin', () => {
    expect(isAdminEmail('usuario@comum.com')).toBe(false);
  });

  it('email ausente não autoriza', () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail('')).toBe(false);
  });

  it('config válida carrega via getAdminEnv', () => {
    expect(getAdminEnv().ADMIN_ALLOWED_EMAILS).toContain('admin@exemplo.com');
  });
});
