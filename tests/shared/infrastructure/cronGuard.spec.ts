import { describe, it, expect, vi } from 'vitest';

vi.stubEnv('CRON_SECRET', 'segredo-cron-teste');

import {
  isCronAuthorized,
  cronUnauthorizedResponse,
} from '@/src/shared/infrastructure/cron/guard';

function requestWith(auth: string | null): Request {
  return new Request('http://localhost/api/cron/terca', {
    headers: auth ? { authorization: auth } : {},
  });
}

describe('cron guard', () => {
  it('autoriza com o Bearer correto', () => {
    expect(isCronAuthorized(requestWith('Bearer segredo-cron-teste'))).toBe(true);
  });

  it('nega sem header authorization', () => {
    expect(isCronAuthorized(requestWith(null))).toBe(false);
  });

  it('nega com segredo errado', () => {
    expect(isCronAuthorized(requestWith('Bearer errado'))).toBe(false);
  });

  it('nega com esquema diferente de Bearer', () => {
    expect(isCronAuthorized(requestWith('Basic segredo-cron-teste'))).toBe(false);
  });

  it('resposta não autorizada é 401 sem vazar o segredo', async () => {
    const res = cronUnauthorizedResponse();

    expect(res.status).toBe(401);
    const body = await res.text();
    expect(body).not.toContain('segredo-cron-teste');
  });
});
