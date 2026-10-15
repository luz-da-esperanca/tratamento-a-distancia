import type { RateLimiter, RateLimitInput, RateLimitResult } from './RateLimiter';

/**
 * Janela deslizante em memória (uma entrada por superfície+identificador).
 * Uso: desenvolvimento e testes. NÃO usar em produção serverless — cada
 * instância teria seu próprio contador (proteção fraca).
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, { windowStart: number; count: number }>();

  async check(input: RateLimitInput): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / input.windowMs) * input.windowMs;
    const chave = `${input.surface}:${input.identifier}`;
    const current = this.hits.get(chave);

    if (!current || current.windowStart !== windowStart) {
      this.hits.set(chave, { windowStart, count: 1 });
      return { allowed: true };
    }

    if (current.count >= input.limit) {
      return { allowed: false };
    }

    current.count += 1;
    return { allowed: true };
  }
}
