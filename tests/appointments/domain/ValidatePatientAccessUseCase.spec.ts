import { describe, it, expect, vi } from 'vitest';
import { ValidatePatientAccessUseCase } from '@/src/features/appointments/application/use-cases/ValidatePatientAccessUseCase';
import { InvalidAccessError } from '@/src/features/appointments/domain/errors/AppointmentErrors';
import {
  makeAppointment,
  makePatient,
  makeProtocolo,
  defaultAppointmentRepo,
  defaultPatientRepo,
} from '@/tests/helpers/factories';

function appointmentComProtocolo(protocolo: string) {
  return makeAppointment({ id: protocolo, protocolo: makeProtocolo(protocolo) });
}

function patientNascidoEm(dataNascimento: string) {
  return makePatient({ dataNascimento: new Date(`${dataNascimento}T12:00:00`) });
}

describe('ValidatePatientAccessUseCase', () => {
  it('retorna o agendamento quando protocolo e nascimento conferem', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findByProtocol: vi.fn(async () => appointmentComProtocolo('AGD-2026-1234')),
    });
    const patientRepo = defaultPatientRepo({
      findById: vi.fn(async () => patientNascidoEm('1990-05-10')),
    });

    const useCase = new ValidatePatientAccessUseCase(appointmentRepo, patientRepo);
    const result = await useCase.execute({ protocolo: 'AGD-2026-1234', dataNascimento: '1990-05-10' });

    expect(result.protocolo.valor).toBe('AGD-2026-1234');
  });

  it('lança InvalidAccessError quando o nascimento não confere', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findByProtocol: vi.fn(async () => appointmentComProtocolo('AGD-2026-1234')),
    });
    const patientRepo = defaultPatientRepo({
      findById: vi.fn(async () => patientNascidoEm('1990-05-10')),
    });

    const useCase = new ValidatePatientAccessUseCase(appointmentRepo, patientRepo);

    await expect(
      useCase.execute({ protocolo: 'AGD-2026-1234', dataNascimento: '2000-01-01' }),
    ).rejects.toBeInstanceOf(InvalidAccessError);
  });

  it('lança InvalidAccessError quando o protocolo não existe', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findByProtocol: vi.fn(async () => null),
    });
    const patientRepo = defaultPatientRepo({
      findById: vi.fn(async () => patientNascidoEm('1990-05-10')),
    });

    const useCase = new ValidatePatientAccessUseCase(appointmentRepo, patientRepo);

    await expect(
      useCase.execute({ protocolo: 'AGD-2026-9999', dataNascimento: '1990-05-10' }),
    ).rejects.toBeInstanceOf(InvalidAccessError);
    expect(vi.mocked(patientRepo.findById)).not.toHaveBeenCalled();
  });

  it('lança InvalidAccessError quando o paciente vinculado não existe (anti-enumeração)', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findByProtocol: vi.fn(async () => appointmentComProtocolo('AGD-2026-1234')),
    });
    const patientRepo = defaultPatientRepo({
      findById: vi.fn(async () => null),
    });

    const useCase = new ValidatePatientAccessUseCase(appointmentRepo, patientRepo);

    await expect(
      useCase.execute({ protocolo: 'AGD-2026-1234', dataNascimento: '1990-05-10' }),
    ).rejects.toBeInstanceOf(InvalidAccessError);
  });

  it('protocolo malformado rejeita antes de consultar (não vaza existência)', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findByProtocol: vi.fn(async () => appointmentComProtocolo('AGD-2026-1234')),
    });
    const patientRepo = defaultPatientRepo();

    const useCase = new ValidatePatientAccessUseCase(appointmentRepo, patientRepo);

    await expect(
      useCase.execute({ protocolo: 'INVALIDO', dataNascimento: '1990-05-10' }),
    ).rejects.toThrow();
    expect(vi.mocked(appointmentRepo.findByProtocol)).not.toHaveBeenCalled();
  });
});
