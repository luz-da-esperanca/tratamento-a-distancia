// Rotina de terça-feira — terças às 08:00 BRT (11:00 UTC).
// Idempotente por flags (segunda execução no dia = no-op).
import { dispararCron } from './utils/disparo';

export default async function handler(): Promise<Response> {
  return dispararCron({ rota: '/api/cron/terca', nome: 'Rotina de terça-feira' });
}

export const config = { schedule: '0 11 * * 2' };
