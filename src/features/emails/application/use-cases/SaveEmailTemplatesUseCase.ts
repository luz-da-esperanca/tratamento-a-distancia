import { EmailTemplate } from '@/src/features/emails/domain/entities/EmailTemplate';
import type { EmailTemplateRepository } from '@/src/features/emails/domain/repositories/EmailTemplateRepository';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';

export interface SaveEmailTemplatesInput {
  tercaAssunto: string;
  tercaCorpo: string;
  quartaAssunto: string;
  quartaCorpo: string;
}

export class SaveEmailTemplatesUseCase {
  constructor(
    private readonly templateRepository: EmailTemplateRepository,
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: SaveEmailTemplatesInput): Promise<void> {
    await this.templateRepository.upsert(
      EmailTemplate.criar({ id: 1, assunto: input.tercaAssunto, corpo: input.tercaCorpo, tipo: 'PROGRAMADO' }),
    );

    await this.templateRepository.upsert(
      EmailTemplate.criar({ id: 2, assunto: input.quartaAssunto, corpo: input.quartaCorpo, tipo: 'PROGRAMADO' }),
    );

    await this.appointmentRepository.resetRoutineFlags();
  }
}
