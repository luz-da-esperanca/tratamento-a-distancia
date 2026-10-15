import { describe, it, expect, vi, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getClientIp } from '@/src/shared/infrastructure/ratelimit/clientIp';
import { MemoryRateLimiter } from '@/src/shared/infrastructure/ratelimit/MemoryRateLimiter';
import { SupabaseRateLimiter } from '@/src/shared/infrastructure/ratelimit/SupabaseRateLimiter';
import { enforceRateLimit } from '@/src/shared/infrastructure/ratelimit/enforceRateLimit';
import { RATE_LIMITS } from '@/src/shared/infrastructure/ratelimit/rateLimitConfig';

const INPUT = { surface: 'teste', identifier: '1.2.3.4', limit: 2, windowMs: 60_000 };

describe('getClientIp', () => {
  it('usa o primeiro IP do x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '9.9.9.9, 1.1.1.1' });

    expect(getClientIp(headers)).toBe('9.9.9.9');
  });

  it('retorna unknown sem header', () => {
    expect(getClientIp(new Headers())).toBe('unknown');
    expect(getClientIp(new Headers({ 'x-forwarded-for': '   ' }))).toBe('unknown');
  });
});

describe('MemoryRateLimiter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('permite até o limite e nega além', async () => {
    const limiter = new MemoryRateLimiter();

    expect(await limiter.check(INPUT)).toEqual({ allowed: true });
    expect(await limiter.check(INPUT)).toEqual({ allowed: true });
    expect(await limiter.check(INPUT)).toEqual({ allowed: false });
  });

  it('isola por superfície e identificador', async () => {
    const limiter = new MemoryRateLimiter();

    expect(await limiter.check({ ...INPUT, limit: 1 })).toEqual({ allowed: true });
    expect(await limiter.check({ ...INPUT, limit: 1 })).toEqual({ allowed: false });
    expect(await limiter.check({ ...INPUT, limit: 1, identifier: '5.6.7.8' })).toEqual({
      allowed: true,
    });
    expect(await limiter.check({ ...INPUT, limit: 1, surface: 'outra' })).toEqual({
      allowed: true,
    });
  });

  it('reseta na janela seguinte', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:10Z'));
    const limiter = new MemoryRateLimiter();

    expect(await limiter.check({ ...INPUT, limit: 1 })).toEqual({ allowed: true });
    expect(await limiter.check({ ...INPUT, limit: 1 })).toEqual({ allowed: false });

    vi.setSystemTime(new Date('2026-01-01T00:01:05Z'));
    expect(await limiter.check({ ...INPUT, limit: 1 })).toEqual({ allowed: true });
  });
});

type Row = { chave: string; janela: string; tentativas: number };

function makeFakeClient(opts: { rows?: Row[]; fail?: 'delete' | 'select' | 'insert' | 'update' } = {}) {
  const rows = new Map((opts.rows ?? []).map((r) => [`${r.chave}|${r.janela}`, r.tentativas]));
  const calls = { deleted: 0, inserted: 0, updated: 0 };
  const fail = (stage: string) => {
    if (opts.fail === stage) throw new Error('db fora');
  };
  return {
    calls,
    client: {
      from: () => ({
        delete: () => ({
          lt: async () => {
            fail('delete');
            calls.deleted += 1;
            return { error: null };
          },
        }),
        select: () => ({
          eq: (col: string, val: string) => ({
            eq: (col2: string, val2: string) => ({
              maybeSingle: async () => {
                fail('select');
                const chave = col === 'chave' ? val : val2;
                const janela = col === 'janela' ? val : val2;
                const tentativas = rows.get(`${chave}|${janela}`);
                return {
                  data: tentativas === undefined ? null : { chave, janela, tentativas },
                  error: null,
                };
              },
            }),
          }),
        }),
        insert: (row: Row) =>
          (async () => {
            fail('insert');
            calls.inserted += 1;
            rows.set(`${row.chave}|${row.janela}`, row.tentativas);
            return { error: null };
          })(),
        update: (patch: { tentativas: number }) => ({
          eq: (col: string, val: string) => ({
            eq: (col2: string, val2: string) =>
              (async () => {
                fail('update');
                calls.updated += 1;
                const chave = col === 'chave' ? val : val2;
                const janela = col === 'janela' ? val : val2;
                rows.set(`${chave}|${janela}`, patch.tentativas);
                return { error: null };
              })(),
          }),
        }),
      }),
    } as unknown as SupabaseClient,
  };
}

describe('SupabaseRateLimiter', () => {
  it('primeira tentativa insere e permite', async () => {
    const fake = makeFakeClient();
    const limiter = new SupabaseRateLimiter(fake.client);

    await expect(limiter.check(INPUT)).resolves.toEqual({ allowed: true });
    expect(fake.calls.inserted).toBe(1);
    expect(fake.calls.deleted).toBe(1);
  });

  it('abaixo do limite incrementa e permite', async () => {
    const windowStart = new Date(Math.floor(Date.now() / INPUT.windowMs) * INPUT.windowMs).toISOString();
    const fake = makeFakeClient({
      rows: [{ chave: `${INPUT.surface}:${INPUT.identifier}`, janela: windowStart, tentativas: 1 }],
    });
    const limiter = new SupabaseRateLimiter(fake.client);

    await expect(limiter.check(INPUT)).resolves.toEqual({ allowed: true });
    expect(fake.calls.updated).toBe(1);
  });

  it('no limite nega sem incrementar', async () => {
    const windowStart = new Date(Math.floor(Date.now() / INPUT.windowMs) * INPUT.windowMs).toISOString();
    const fake = makeFakeClient({
      rows: [{ chave: `${INPUT.surface}:${INPUT.identifier}`, janela: windowStart, tentativas: 2 }],
    });
    const limiter = new SupabaseRateLimiter(fake.client);

    await expect(limiter.check(INPUT)).resolves.toEqual({ allowed: false });
    expect(fake.calls.updated).toBe(0);
  });

  it('erro do banco propaga (chamador nega: fail-closed)', async () => {
    const fake = makeFakeClient({ fail: 'select' });
    const limiter = new SupabaseRateLimiter(fake.client);

    await expect(limiter.check(INPUT)).rejects.toThrow('db fora');
  });
});

describe('enforceRateLimit', () => {
  it('repasa permitido/negado', async () => {
    expect(
      await enforceRateLimit({ check: async () => ({ allowed: true }) }, INPUT),
    ).toBe(true);
    expect(
      await enforceRateLimit({ check: async () => ({ allowed: false }) }, INPUT),
    ).toBe(false);
  });

  it('nega + loga quando o limiter lança', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const allowed = await enforceRateLimit(
        {
          check: async () => {
            throw new Error('db fora');
          },
        },
        INPUT,
      );

      expect(allowed).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe('RATE_LIMITS', () => {
  it('cobre as 4 superfícies com limites positivos', () => {
    for (const config of Object.values(RATE_LIMITS)) {
      expect(config.limit).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
      expect(config.surface).toBeTruthy();
    }
    expect(Object.keys(RATE_LIMITS)).toEqual(['inscricao', 'acessoPaciente', 'loginAdmin', 'cron']);
  });
});
