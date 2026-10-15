export interface DisparoInput {
  rota: '/api/cron/terca' | '/api/cron/quarta' | '/api/cron/alertas';
  nome: string;
}

const RESPOSTA_MAX = 2000;

/**
 * Dispara uma rota `/api/cron/*` do próprio site com o `Bearer CRON_SECRET`.
 *
 * Envs (já existentes no deploy; `URL` a Netlify injeta sozinha):
 * - `URL` — base do site (ex.: https://luzdaesperanca.org)
 * - `CRON_SECRET` — o mesmo das rotas
 *
 * Falha explícita (throw) em qualquer problema: a invocação agendada aparece
 * como falha nos Function logs da Netlify em vez de passar em silêncio.
 */
export async function dispararCron(input: DisparoInput): Promise<Response> {
  const baseUrl = process.env.URL;
  if (!baseUrl) {
    throw new Error('[cron-fn] URL do site ausente (env URL da Netlify).');
  }
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error('[cron-fn] CRON_SECRET ausente.');
  }

  const url = `${baseUrl.replace(/\/$/, '')}${input.rota}`;
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const corpo = (await response.text()).slice(0, RESPOSTA_MAX);

  if (!response.ok) {
    throw new Error(`[cron-fn] ${input.nome} falhou: HTTP ${response.status} — ${corpo}`);
  }

  console.log(`[cron-fn] ${input.nome} ok: ${corpo}`);
  return Response.json({ ok: true, rota: input.rota, resposta: corpo });
}
