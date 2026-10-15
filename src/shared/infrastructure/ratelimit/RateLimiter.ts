export interface RateLimitInput {
  /** Superfície protegida (ex.: 'inscricao', 'acesso-paciente', 'login-admin', 'cron'). */
  surface: string;
  /** Identificador do chamador (normalmente o IP). */
  identifier: string;
  /** Máximo de tentativas dentro da janela. */
  limit: number;
  /** Tamanho da janela deslizante em milissegundos. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
}

export interface RateLimiter {
  check(input: RateLimitInput): Promise<RateLimitResult>;
}
