import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DomainError } from '@/src/shared/domain/errors';

vi.stubEnv('CRON_SECRET', 'segredo-cron-teste');

const tuesdayExecute = vi.fn();
const wednesdayExecute = vi.fn();
const alertsExecute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeSendRoutineTuesdayUseCase: vi.fn(() => ({ execute: tuesdayExecute })),
  makeSendRoutineWednesdayUseCase: vi.fn(() => ({ execute: wednesdayExecute })),
  makeSendSurgeryAlertsUseCase: vi.fn(() => ({ execute: alertsExecute })),
}));

import { GET as terca } from '@/app/api/cron/terca/route';
import { GET as quarta } from '@/app/api/cron/quarta/route';
import { GET as alertas } from '@/app/api/cron/alertas/route';

function authed(url: string): Request {
  return new Request(url, { headers: { authorization: 'Bearer segredo-cron-teste' } });
}

describe('rotas /api/cron/* — autorização', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['terca', terca],
    ['quarta', quarta],
    ['alertas', alertas],
  ])('GET /api/cron/%s sem Bearer retorna 401 sem executar rotina', async (_nome, handler) => {
    const res = await handler(new Request(`http://localhost/api/cron/${_nome}`));

    expect(res.status).toBe(401);
    expect(tuesdayExecute).not.toHaveBeenCalled();
    expect(wednesdayExecute).not.toHaveBeenCalled();
    expect(alertsExecute).not.toHaveBeenCalled();
  });

  it('terca autorizada executa rotina e retorna mensagem', async () => {
    tuesdayExecute.mockResolvedValueOnce({ enviados: 3, total: 5 });

    const res = await terca(authed('http://localhost/api/cron/terca'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain('3 de 5');
  });

  it('terca mapeia erro de domínio para o status correspondente', async () => {
    tuesdayExecute.mockRejectedValueOnce(new DomainError('TEMPLATE_NOT_FOUND', 'Template não encontrado.', 404));

    const res = await terca(authed('http://localhost/api/cron/terca'));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Template não encontrado.');
  });

  it('quarta autorizada executa rotina e retorna mensagem', async () => {
    wednesdayExecute.mockResolvedValueOnce({ enviados: 2, total: 4 });

    const res = await quarta(authed('http://localhost/api/cron/quarta'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain('2 de 4');
  });

  it('quarta mapeia erro de domínio para o status correspondente', async () => {
    wednesdayExecute.mockRejectedValueOnce(
      new DomainError('TEMPLATE_NOT_FOUND', 'Template de Quarta-feira não encontrado.', 404),
    );

    const res = await quarta(authed('http://localhost/api/cron/quarta'));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Template de Quarta-feira não encontrado.');
  });

  it('alertas autorizada executa rotina e retorna contagem', async () => {
    alertsExecute.mockResolvedValueOnce({ alertasEnviados: 5 });

    const res = await alertas(authed('http://localhost/api/cron/alertas'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain('5 alertas de cirurgia enviados');
  });

  it.each([
    ['terca', terca, tuesdayExecute],
    ['quarta', quarta, wednesdayExecute],
    ['alertas', alertas, alertsExecute],
  ])('GET /api/cron/%s com erro inesperado retorna 500 genérico sem vazar', async (nome, handler, execute) => {
    execute.mockRejectedValueOnce(new Error('connection string segredo-xyz'));

    const res = await handler(authed(`http://localhost/api/cron/${nome}`));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).not.toContain('segredo-xyz');
    expect(typeof body.error).toBe('string');
  });
});
