import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-teste');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-teste');
vi.stubEnv('ADMIN_ALLOWED_EMAILS', 'admin@exemplo.com');

const getUser = vi.fn();

vi.mock('@/src/shared/infrastructure/database/supabase/middleware', () => ({
  updateSession: vi.fn(async () => NextResponse.next()),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ auth: { getUser } })),
}));

import { middleware } from '@/src/middleware';

function request(path: string): NextRequest {
  return new NextRequest(new URL(`http://localhost${path}`));
}

describe('middleware — guard admin fail-closed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('admin acessa /admin/painel (pass-through)', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { email: 'admin@exemplo.com' } } });

    const res = await middleware(request('/admin/painel'));

    expect(res.headers.get('location')).toBeNull();
  });

  it('admin com caixa alta/espaços é reconhecido (normalização)', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { email: '  Admin@Exemplo.com ' } } });

    const res = await middleware(request('/admin/painel'));

    expect(res.headers.get('location')).toBeNull();
  });

  it('autenticado não-admin é redirecionado para /admin/login', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { email: 'usuario@comum.com' } } });

    const res = await middleware(request('/admin/painel'));

    expect(res.headers.get('location')).toBe('http://localhost/admin/login');
  });

  it('não autenticado é redirecionado para /admin/login (fail-closed)', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });

    const res = await middleware(request('/admin/painel'));

    expect(res.headers.get('location')).toBe('http://localhost/admin/login');
  });

  it('admin visitando /admin/login é redirecionado ao painel', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { email: 'admin@exemplo.com' } } });

    const res = await middleware(request('/admin/login'));

    expect(res.headers.get('location')).toBe('http://localhost/admin/painel');
  });

  it('não-admin visitando /admin/login passa (tela de login)', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });

    const res = await middleware(request('/admin/login'));

    expect(res.headers.get('location')).toBeNull();
  });

  it('rota pública não é afetada pelo guard', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });

    const res = await middleware(request('/tratamento/AGD-2026-1234'));

    expect(res.headers.get('location')).toBeNull();
  });
});
