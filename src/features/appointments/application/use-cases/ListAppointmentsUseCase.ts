import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import type { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import type { Patient } from '@/src/features/patients/domain/entities/Patient';

export interface AppointmentListItem {
  appointment: Appointment;
  paciente: Patient | null;
}

export interface ListAppointmentsOutput {
  itens: AppointmentListItem[];
}

export class ListAppointmentsUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async execute(): Promise<ListAppointmentsOutput> {
    const agendamentos = await this.appointmentRepository.list();

    const itens = await Promise.all(
      agendamentos.map(async (appointment) => ({
        appointment,
        paciente: await this.patientRepository.findById(appointment.pacienteId),
      })),
    );

    return { itens };
  }
}
