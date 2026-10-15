import { NextResponse } from 'next/server';
import { isCronAuthorized, cronUnauthorizedResponse } from '@/src/shared/infrastructure/cron/guard';
import { makeSendRoutineTuesdayUseCase, makeRateLimiter } from '@/src/shared/infrastructure/composition/container';
import { enforceRateLimit } from '@/src/shared/infrastructure/ratelimit/enforceRateLimit';
import { getClientIp } from '@/src/shared/infrastructure/ratelimit/clientIp';
import { RATE_LIMITS } from '@/src/shared/infrastructure/ratelimit/rateLimitConfig';
import { toAppError } from '@/src/shared/domain/errors';

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return cronUnauthorizedResponse();
  }

  const allowed = await enforceRateLimit(makeRateLimiter(), {
    ...RATE_LIMITS.cron,
    identifier: getClientIp(request.headers),
  });
  if (!allowed) {
    return NextResponse.json({ error: 'Limite de requisições excedido.' }, { status: 429 });
  }

  try {
    const result = await makeSendRoutineTuesdayUseCase().execute();
    return NextResponse.json({
      message: `Rotina de Terça-feira executada para ${result.enviados} de ${result.total} pacientes.`,
    });
  } catch (error) {
    const appError = toAppError(error);
    console.error('[CRON Terça]', error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
