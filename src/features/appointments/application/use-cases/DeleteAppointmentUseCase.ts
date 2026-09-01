import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import { AppointmentNotFoundError } from '@/src/features/appointments/domain/errors/AppointmentErrors';

export interface DeleteAppointmentInput {
  protocolo: string;
  pacienteId: string;
}

export class DeleteAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async execute(input: DeleteAppointmentInput): Promise<void> {
    const protocolo = Protocolo.criar(input.protocolo);
    const existente = await this.appointmentRepository.findByProtocol(protocolo);

    if (!existente) {
      throw new AppointmentNotFoundError(input.protocolo);
    }

    await this.appointmentRepository.delete(input.protocolo);
    await this.patientRepository.delete(input.pacienteId);
  }
}
