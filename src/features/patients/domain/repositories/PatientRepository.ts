import type { Patient } from '../entities/Patient';

export interface PatientRepository {
  save(patient: Patient): Promise<void>;
  findById(id: string): Promise<Patient | null>;
  delete(id: string): Promise<void>;
}
