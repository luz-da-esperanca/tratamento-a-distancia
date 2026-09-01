import { NextResponse } from 'next/server';
import { isCronAuthorized, cronUnauthorizedResponse } from '@/src/shared/infrastructure/cron/guard';
import { makeSendRoutineWednesdayUseCase } from '@/src/shared/infrastructure/composition/container';
import { toAppError } from '@/src/shared/domain/errors';

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return cronUnauthorizedResponse();
  }

  try {
    const result = await makeSendRoutineWednesdayUseCase().execute();
    return NextResponse.json({
      message: `Rotina de Quarta-feira executada para ${result.enviados} de ${result.total} pacientes.`,
    });
  } catch (error) {
    const appError = toAppError(error);
    console.error('[CRON Quarta]', error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
