import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailTemplateRepository } from '@/src/features/emails/domain/repositories/EmailTemplateRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';

export interface SendSpecificAlertInput {
  protocolos: string[];
  assunto: string;
  mensagem: string;
}

export class SendSpecificAlertUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly templateRepository: EmailTemplateRepository,
    private readonly emailGateway: EmailGateway,
  ) {}

  async execute(input: SendSpecificAlertInput): Promise<number> {
    const agendamentos = await Promise.all(
      input.protocolos.map((p) => this.appointmentRepository.findByProtocol(Protocolo.criar(p))),
    );

    const emails = agendamentos.filter((a): a is NonNullable<typeof a> => a !== null).map((a) => a.emailNotificacao);

    if (emails.length > 0) {
      await this.emailGateway.send({ para: emails, assunto: input.assunto, corpoHtml: input.mensagem });
    }

    await this.templateRepository.registrarEnvioPontual(input.assunto, input.mensagem);

    return emails.length;
  }
}
