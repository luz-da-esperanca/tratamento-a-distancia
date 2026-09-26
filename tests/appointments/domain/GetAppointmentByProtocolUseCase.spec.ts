import { describe, it, expect, vi } from 'vitest';
import { GetAppointmentByProtocolUseCase } from '@/src/features/appointments/application/use-cases/GetAppointmentByProtocolUseCase';
import type { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import type { Patient } from '@/src/features/patients/domain/entities/Patient';
import { AppointmentNotFoundError } from '@/src/features/appointments/domain/errors/AppointmentErrors';
import {
  makeAppointment,
  makePatient,
  defaultAppointmentRepo,
  defaultPatientRepo,
} from '@/tests/helpers/factories';

function buildRepos(foundAppointment: Appointment | null, foundPatient: Patient | null) {
  const appointmentRepo = defaultAppointmentRepo({ findByProtocol: vi.fn(async () => foundAppointment) });
  const patientRepo = defaultPatientRepo({ findById: vi.fn(async () => foundPatient) });
  return { appointmentRepo, patientRepo };
}

describe('GetAppointmentByProtocolUseCase', () => {
  it('retorna agendamento com paciente vinculado', async () => {
    const { appointmentRepo, patientRepo } = buildRepos(makeAppointment(), makePatient());
    const useCase = new GetAppointmentByProtocolUseCase(appointmentRepo, patientRepo);

    const result = await useCase.execute({ protocolo: 'AGD-2026-1111' });

    expect(result.appointment.protocolo.valor).toBe('AGD-2026-1111');
    expect(result.paciente?.nomeCompleto).toBe('Maria Silva');
    expect(vi.mocked(patientRepo.findById)).toHaveBeenCalledWith('pac-1');
  });

  it('retorna paciente null quando o vínculo não existe (sem falhar)', async () => {
    const { appointmentRepo, patientRepo } = buildRepos(makeAppointment(), null);
    const useCase = new GetAppointmentByProtocolUseCase(appointmentRepo, patientRepo);

    const result = await useCase.execute({ protocolo: 'AGD-2026-1111' });

    expect(result.appointment).toBeDefined();
    expect(result.paciente).toBeNull();
  });

  it('lança AppointmentNotFoundError para protocolo inexistente', async () => {
    const { appointmentRepo, patientRepo } = buildRepos(null, null);
    const useCase = new GetAppointmentByProtocolUseCase(appointmentRepo, patientRepo);

    await expect(useCase.execute({ protocolo: 'AGD-2026-9999' })).rejects.toBeInstanceOf(
      AppointmentNotFoundError,
    );
    expect(vi.mocked(patientRepo.findById)).not.toHaveBeenCalled();
  });
});
