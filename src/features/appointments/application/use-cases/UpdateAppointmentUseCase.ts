import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import { AppointmentNotFoundError } from '@/src/features/appointments/domain/errors/AppointmentErrors';

export interface UpdateAppointmentFields {
  status?: 'AGENDADO' | 'FINALIZADO';
  emailNotificacao?: string;
  celular?: string;
  tipoWhatsapp?: string;
  whatsappAuxiliar?: string;
  ehIntercessorio?: boolean;
  nomeSolicitante?: string;
  dataCirurgia?: Date;
}

export interface UpdateAppointmentInput {
  protocolo: string;
  campos: UpdateAppointmentFields;
}

export class UpdateAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: UpdateAppointmentInput): Promise<void> {
    const protocolo = Protocolo.criar(input.protocolo);
    const existente = await this.appointmentRepository.findByProtocol(protocolo);

    if (!existente) {
      throw new AppointmentNotFoundError(input.protocolo);
    }

    const props = existente.toProps();
    const c = input.campos;

    const atualizado = Appointment.reconstituir({
      ...props,
      status: c.status ?? props.status,
      emailNotificacao: c.emailNotificacao ?? props.emailNotificacao,
      celular: c.celular ?? props.celular,
      tipoWhatsapp: c.tipoWhatsapp ?? props.tipoWhatsapp,
      whatsappAuxiliar: c.whatsappAuxiliar !== undefined ? c.whatsappAuxiliar : props.whatsappAuxiliar,
      ehIntercessorio: c.ehIntercessorio ?? props.ehIntercessorio,
      nomeSolicitante: c.nomeSolicitante ?? props.nomeSolicitante,
      dataCirurgia: c.dataCirurgia !== undefined ? c.dataCirurgia : props.dataCirurgia,
    });

    await this.appointmentRepository.update(atualizado);
  }
}
