export const RATE_LIMITS = {
  /** Cadastro público: anti-spam + custo Resend/Supabase. */
  inscricao: { surface: 'inscricao', limit: 5, windowMs: 60_000 },
  /** Sessão do paciente: anti-enumeração de protocolo + nascimento. */
  acessoPaciente: { surface: 'acesso-paciente', limit: 10, windowMs: 60_000 },
  /** Login admin: anti-brute-force (além do limite do Supabase Auth). */
  loginAdmin: { surface: 'login-admin', limit: 5, windowMs: 60_000 },
  /** Crons autenticados: folga generosa, anti-abuso. */
  cron: { surface: 'cron', limit: 30, windowMs: 60_000 },
} as const;
