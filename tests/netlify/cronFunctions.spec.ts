import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('URL', 'https://site-exemplo.org');
vi.stubEnv('CRON_SECRET', 'segredo-cron-teste');

import handlerTerca, { config as configTerca } from '@/netlify/functions/cron-terca';
import handlerQuarta, { config as configQuarta } from '@/netlify/functions/cron-quarta';
import handlerAlertas, { config as configAlertas } from '@/netlify/functions/cron-alertas';

const fetchMock = vi.fn();

function okUpstream(corpo = '{"message":"ok"}') {
  fetchMock.mockResolvedValueOnce(new Response(corpo, { status: 200 }));
}

function failUpstream(status: number) {
  fetchMock.mockResolvedValueOnce(new Response('erro', { status }));
}

describe('scheduled functions — schedules', () => {
  it('terça, quarta e alertas nos mesmos horários do vercel.json (08:00 BRT)', () => {
    expect(configTerca).toEqual({ schedule: '0 11 * * 2' });
    expect(configQuarta).toEqual({ schedule: '0 11 * * 3' });
    expect(configAlertas).toEqual({ schedule: '0 11 * * *' });
  });
});

describe.each([
  ['terca', handlerTerca, '/api/cron/terca'],
  ['quarta', handlerQuarta, '/api/cron/quarta'],
  ['alertas', handlerAlertas, '/api/cron/alertas'],
] as const)('scheduled function %s', (_nome, handler, rota) => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    vi.stubEnv('URL', 'https://site-exemplo.org');
    vi.stubEnv('CRON_SECRET', 'segredo-cron-teste');
  });

  it('chama a rota com Bearer e retorna o resultado', async () => {
    okUpstream();

    const response = await handler();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(`https://site-exemplo.org${rota}`, {
      headers: { authorization: 'Bearer segredo-cron-teste' },
    });
    expect(response.status).toBe(200);
  });

  it('upstream 500/401 vira falha explícita (visível nos logs)', async () => {
    failUpstream(500);
    await expect(handler()).rejects.toThrow(/falhou: HTTP 500/);

    failUpstream(401);
    await expect(handler()).rejects.toThrow(/falhou: HTTP 401/);
  });

  it('sem CRON_SECRET falha antes do fetch', async () => {
    vi.stubEnv('CRON_SECRET', '');

    await expect(handler()).rejects.toThrow(/CRON_SECRET ausente/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sem URL falha antes do fetch', async () => {
    vi.stubEnv('URL', '');

    await expect(handler()).rejects.toThrow(/URL do site ausente/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
