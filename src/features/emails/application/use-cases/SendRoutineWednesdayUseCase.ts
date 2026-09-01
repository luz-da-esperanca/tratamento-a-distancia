import { DomainError } from '@/src/shared/domain/errors';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailTemplateRepository } from '@/src/features/emails/domain/repositories/EmailTemplateRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';

export interface RoutineResult {
  enviados: number;
  total: number;
}

export class SendRoutineWednesdayUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly templateRepository: EmailTemplateRepository,
    private readonly emailGateway: EmailGateway,
  ) {}

  async execute(): Promise<RoutineResult> {
    const template = await this.templateRepository.findById(2);

    if (!template) {
      throw new DomainError('TEMPLATE_NOT_FOUND', 'Template de Quarta-feira não encontrado.', 404);
    }

    const pendentes = await this.appointmentRepository.findPendingRoutine('quarta');
    let enviados = 0;

    for (const agendamento of pendentes) {
      const resultado = await this.emailGateway.send({
        para: agendamento.emailNotificacao,
        assunto: template.assunto,
        corpoHtml: template.corpo,
      });

      if (resultado.ok) {
        agendamento.marcarEmailQuartaEnviado();
        await this.appointmentRepository.update(agendamento);
        enviados++;
      }
    }

    return { enviados, total: pendentes.length };
  }
}
