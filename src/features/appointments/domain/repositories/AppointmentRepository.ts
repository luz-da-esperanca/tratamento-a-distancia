import type { Appointment } from '../entities/Appointment';
import type { Protocolo } from '../value-objects/Protocolo';

export interface AppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findByProtocol(protocolo: Protocolo): Promise<Appointment | null>;
  update(appointment: Appointment): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<Appointment[]>;
  findPendingRoutine(tipo: 'terca' | 'quarta'): Promise<Appointment[]>;
  findUpcomingSurgeryAlerts(asOf: Date): Promise<Appointment[]>;
  resetRoutineFlags(): Promise<void>;
}
