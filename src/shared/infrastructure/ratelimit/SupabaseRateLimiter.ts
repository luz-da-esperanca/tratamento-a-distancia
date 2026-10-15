import type { SupabaseClient } from '@supabase/supabase-js';
import type { RateLimiter, RateLimitInput, RateLimitResult } from './RateLimiter';

interface RateLimitRow {
  chave: string;
  janela: string;
  tentativas: number;
}

/**
 * Janela deslizante no Postgres (tabela `rate_limit_hits`, migration 02).
 *
 * Funciona entre instâncias serverless (estado no banco, não na memória).
 * Concorrência exata não é garantida no read-modify-write — aceitável para
 * throttle anti-abuso (o erro tende a negar a mais, nunca a menos).
 * Qualquer erro propaga para o chamador decidir (o helper `enforceRateLimit`
 * nega + loga: fail-closed).
 */
export class SupabaseRateLimiter implements RateLimiter {
  constructor(private readonly client: SupabaseClient) {}

  async check(input: RateLimitInput): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = new Date(Math.floor(now / input.windowMs) * input.windowMs);
    const chave = `${input.surface}:${input.identifier}`;

    // Limpeza best-effort das janelas expiradas (tabela não cresce sem limite).
    const { error: cleanupError } = await this.client
      .from('rate_limit_hits')
      .delete()
      .lt('janela', new Date(now - input.windowMs).toISOString());
    if (cleanupError) throw cleanupError;

    const { data, error: selectError } = await this.client
      .from('rate_limit_hits')
      .select('chave,janela,tentativas')
      .eq('chave', chave)
      .eq('janela', windowStart.toISOString())
      .maybeSingle<RateLimitRow>();
    if (selectError) throw selectError;

    if (!data) {
      const { error: insertError } = await this.client
        .from('rate_limit_hits')
        .insert({ chave, janela: windowStart.toISOString(), tentativas: 1 });
      if (insertError) throw insertError;
      return { allowed: true };
    }

    if (data.tentativas >= input.limit) {
      return { allowed: false };
    }

    const { error: updateError } = await this.client
      .from('rate_limit_hits')
      .update({ tentativas: data.tentativas + 1 })
      .eq('chave', chave)
      .eq('janela', windowStart.toISOString());
    if (updateError) throw updateError;
    return { allowed: true };
  }
}
