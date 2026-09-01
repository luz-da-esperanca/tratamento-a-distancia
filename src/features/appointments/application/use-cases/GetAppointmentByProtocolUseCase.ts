import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import { AppointmentNotFoundError } from '@/src/features/appointments/domain/errors/AppointmentErrors';
import type { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import type { Patient } from '@/src/features/patients/domain/entities/Patient';

export interface GetAppointmentByProtocolInput {
  protocolo: string;
}

export interface GetAppointmentByProtocolOutput {
  appointment: Appointment;
  paciente: Patient | null;
}

export class GetAppointmentByProtocolUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async execute(input: GetAppointmentByProtocolInput): Promise<GetAppointmentByProtocolOutput> {
    const protocolo = Protocolo.criar(input.protocolo);
    const agendamento = await this.appointmentRepository.findByProtocol(protocolo);

    if (!agendamento) {
      throw new AppointmentNotFoundError(input.protocolo);
    }

    const paciente = await this.patientRepository.findById(agendamento.pacienteId);

    return { appointment: agendamento, paciente };
  }
}
