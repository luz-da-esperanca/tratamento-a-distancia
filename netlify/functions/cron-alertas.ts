// Alertas de cirurgia — diário às 08:00 BRT (11:00 UTC).
// ATENÇÃO: o use-case não tem flag de enviado (marcos 15/7/3/0 dias), então
// exatamente 1 execução/dia — rodada dupla no mesmo dia DUPLICA e-mails.
import { dispararCron } from './utils/disparo';

export default async function handler(): Promise<Response> {
  return dispararCron({ rota: '/api/cron/alertas', nome: 'Alertas de cirurgia' });
}

export const config = { schedule: '0 11 * * *' };
