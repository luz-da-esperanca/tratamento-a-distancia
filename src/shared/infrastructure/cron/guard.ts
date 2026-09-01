import { getCronEnv } from '@/src/shared/infrastructure/config/env';

export function isCronAuthorized(request: Request): boolean {
  const env = getCronEnv();
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${env.CRON_SECRET}`;
}

export function cronUnauthorizedResponse(): Response {
  return new Response('Não autorizado', { status: 401 });
}
