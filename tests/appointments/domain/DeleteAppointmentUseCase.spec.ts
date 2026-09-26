import { describe, it, expect, vi } from 'vitest';
import { DeleteAppointmentUseCase } from '@/src/features/appointments/application/use-cases/DeleteAppointmentUseCase';
import type { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import { AppointmentNotFoundError } from '@/src/features/appointments/domain/errors/AppointmentErrors';
import { makeAppointment, defaultAppointmentRepo, defaultPatientRepo } from '@/tests/helpers/factories';

function buildRepos(found: Appointment | null) {
  const appointmentRepo = defaultAppointmentRepo({ findByProtocol: vi.fn(async () => found) });
  const patientRepo = defaultPatientRepo();
  return { appointmentRepo, patientRepo };
}

describe('DeleteAppointmentUseCase', () => {
  it('remove agendamento e paciente vinculado', async () => {
    const { appointmentRepo, patientRepo } = buildRepos(makeAppointment());
    const useCase = new DeleteAppointmentUseCase(appointmentRepo, patientRepo);

    await useCase.execute({ protocolo: 'AGD-2026-1111', pacienteId: 'pac-1' });

    expect(vi.mocked(appointmentRepo.delete)).toHaveBeenCalledWith('AGD-2026-1111');
    expect(vi.mocked(patientRepo.delete)).toHaveBeenCalledWith('pac-1');
  });

  it('lança AppointmentNotFoundError e não remove nada quando o protocolo não existe', async () => {
    const { appointmentRepo, patientRepo } = buildRepos(null);
    const useCase = new DeleteAppointmentUseCase(appointmentRepo, patientRepo);

    await expect(
      useCase.execute({ protocolo: 'AGD-2026-9999', pacienteId: 'pac-1' }),
    ).rejects.toBeInstanceOf(AppointmentNotFoundError);
    expect(vi.mocked(appointmentRepo.delete)).not.toHaveBeenCalled();
    expect(vi.mocked(patientRepo.delete)).not.toHaveBeenCalled();
  });
});
