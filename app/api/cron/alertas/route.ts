import { NextResponse } from 'next/server';
import { isCronAuthorized, cronUnauthorizedResponse } from '@/src/shared/infrastructure/cron/guard';
import { makeSendSurgeryAlertsUseCase } from '@/src/shared/infrastructure/composition/container';
import { toAppError } from '@/src/shared/domain/errors';

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return cronUnauthorizedResponse();
  }

  try {
    const result = await makeSendSurgeryAlertsUseCase().execute();
    return NextResponse.json({
      message: `Rotina diária finalizada. ${result.alertasEnviados} alertas de cirurgia enviados.`,
    });
  } catch (error) {
    const appError = toAppError(error);
    console.error('[CRON Alertas]', error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
