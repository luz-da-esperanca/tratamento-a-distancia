import type { RateLimiter, RateLimitInput } from './RateLimiter';

/**
 * Invólucro fail-closed: qualquer erro do limiter (banco fora, rede, bug)
 * nega a tentativa e loga — nunca libera por falha do próprio throttle.
 */
export async function enforceRateLimit(
  limiter: RateLimiter,
  input: RateLimitInput,
): Promise<boolean> {
  try {
    const result = await limiter.check(input);
    return result.allowed;
  } catch (error) {
    console.error(`[ratelimit] Falha no throttle (${input.surface}) — negando:`, error);
    return false;
  }
}
