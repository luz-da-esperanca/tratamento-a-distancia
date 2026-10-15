import { describe, it, expect, vi } from 'vitest';

vi.stubEnv('CRON_SECRET', 'segredo-cron-teste');

const tuesdayExecute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeSendRoutineTuesdayUseCase: vi.fn(() => ({ execute: tuesdayExecute })),
  makeRateLimiter: vi.fn(() => ({ check: vi.fn(async () => ({ allowed: false })) })),
}));

import { GET as terca } from '@/app/api/cron/terca/route';

describe('rotas /api/cron/* — throttle', () => {
  it('autenticado mas estourado retorna 429 sem alcançar o use-case', async () => {
    const request = new Request('https://exemplo.com/api/cron/terca', {
      headers: { authorization: 'Bearer segredo-cron-teste' },
    });

    const response = await terca(request);

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'Limite de requisições excedido.' });
    expect(tuesdayExecute).not.toHaveBeenCalled();
  });
});
