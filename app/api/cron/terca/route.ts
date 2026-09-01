import { NextResponse } from 'next/server';
import { isCronAuthorized, cronUnauthorizedResponse } from '@/src/shared/infrastructure/cron/guard';
import { makeSendRoutineTuesdayUseCase } from '@/src/shared/infrastructure/composition/container';
import { toAppError } from '@/src/shared/domain/errors';

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return cronUnauthorizedResponse();
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
