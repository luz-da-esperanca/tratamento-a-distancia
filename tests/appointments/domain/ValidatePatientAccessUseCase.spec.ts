import { describe, it, expect, vi } from 'vitest';
import { ValidatePatientAccessUseCase } from '@/src/features/appointments/application/use-cases/ValidatePatientAccessUseCase';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import { Patient } from '@/src/features/patients/domain/entities/Patient';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { InvalidAccessError } from '@/src/features/appointments/domain/errors/AppointmentErrors';

function makeAppointment(protocolo: string) {
  return Appointment.reconstituir({
    id: protocolo,
    protocolo: Protocolo.criar(protocolo),
    pacienteId: 'pid',
    dataCadastro: new Date(),
    status: 'AGENDADO',
    emailNotificacao: 'a@b.com',
    celular: '11999999999',
    tipoWhatsapp: 'E_WHATSAPP',
    ehIntercessorio: false,
    nomeSolicitante: 'X',
    enviouEmailTerca: false,
    enviouEmailQuarta: false,
    tipo: 'TRATAMENTO_SEM_CIRURGIA',
  });
}

function makePatient(dataNascimento: string) {
  return Patient.reconstituir({
    id: 'pid',
    nomeCompleto: 'Ana',
    dataNascimento: new Date(`${dataNascimento}T12:00:00`),
    pais: 'B',
    estado: 'SP',
    cidade: 'C',
    endereco: 'R',
  });
}

describe('ValidatePatientAccessUseCase', () => {
  it('retorna o agendamento quando protocolo e nascimento conferem', async () => {
    const appointmentRepo: AppointmentRepository = {
      ...defaultAppointmentRepo(),
      findByProtocol: vi.fn(async () => makeAppointment('AGD-2026-1234')),
    };
    const patientRepo: PatientRepository = {
      ...defaultPatientRepo(),
      findById: vi.fn(async () => makePatient('1990-05-10')),
    };

    const useCase = new ValidatePatientAccessUseCase(appointmentRepo, patientRepo);
    const result = await useCase.execute({ protocolo: 'AGD-2026-1234', dataNascimento: '1990-05-10' });

    expect(result.protocolo.valor).toBe('AGD-2026-1234');
  });

  it('lança InvalidAccessError quando o nascimento não confere', async () => {
    const appointmentRepo: AppointmentRepository = {
      ...defaultAppointmentRepo(),
      findByProtocol: vi.fn(async () => makeAppointment('AGD-2026-1234')),
    };
    const patientRepo: PatientRepository = {
      ...defaultPatientRepo(),
      findById: vi.fn(async () => makePatient('1990-05-10')),
    };

    const useCase = new ValidatePatientAccessUseCase(appointmentRepo, patientRepo);

    await expect(
      useCase.execute({ protocolo: 'AGD-2026-1234', dataNascimento: '2000-01-01' }),
    ).rejects.toBeInstanceOf(InvalidAccessError);
  });
});

function defaultAppointmentRepo(): AppointmentRepository {
  return {
    save: vi.fn(async () => {}),
    findByProtocol: vi.fn(async () => null),
    update: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    list: vi.fn(async () => []),
    findPendingRoutine: vi.fn(async () => []),
    findUpcomingSurgeryAlerts: vi.fn(async () => []),
    resetRoutineFlags: vi.fn(async () => {}),
  };
}

function defaultPatientRepo(): PatientRepository {
  return {
    save: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    delete: vi.fn(async () => {}),
  };
}
