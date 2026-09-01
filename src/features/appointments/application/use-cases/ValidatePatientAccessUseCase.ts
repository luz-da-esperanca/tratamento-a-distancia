import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import { InvalidAccessError } from '@/src/features/appointments/domain/errors/AppointmentErrors';
import type { Appointment } from '@/src/features/appointments/domain/entities/Appointment';

export interface ValidatePatientAccessInput {
  protocolo: string;
  dataNascimento: string;
}

export class ValidatePatientAccessUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async execute(input: ValidatePatientAccessInput): Promise<Appointment> {
    const protocolo = Protocolo.criar(input.protocolo);
    const agendamento = await this.appointmentRepository.findByProtocol(protocolo);

    if (!agendamento) {
      throw new InvalidAccessError();
    }

    const paciente = await this.patientRepository.findById(agendamento.pacienteId);

    if (!paciente) {
      throw new InvalidAccessError();
    }

    const nascimento = paciente.dataNascimento.toISOString().split('T')[0];
    if (nascimento !== input.dataNascimento) {
      throw new InvalidAccessError();
    }

    return agendamento;
  }
}
