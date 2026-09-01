import { describe, it, expect, vi } from 'vitest';
import { CreateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { ok } from '@/src/shared/domain/Result';
import type { OpcaoWhatsApp } from '@/types/database';

function buildFakes() {
  const patientRepo: PatientRepository = {
    save: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    delete: vi.fn(async () => {}),
  };
  const appointmentRepo: AppointmentRepository = {
    save: vi.fn(async () => {}),
    findByProtocol: vi.fn(async () => null),
    update: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    list: vi.fn(async () => []),
    findPendingRoutine: vi.fn(async () => []),
    findUpcomingSurgeryAlerts: vi.fn(async () => []),
    resetRoutineFlags: vi.fn(async () => {}),
  };
  const emailGateway: EmailGateway = {
    send: vi.fn(async () => ok({ id: 'x' })),
  };
  return { patientRepo, appointmentRepo, emailGateway };
}

function baseInput(tipo: 'TRATAMENTO_COM_CIRURGIA' | 'TRATAMENTO_SEM_CIRURGIA') {
  return {
    nomeCompleto: 'Ana',
    dataNascimento: '1990-05-10',
    pais: 'Brasil',
    estado: 'SP',
    cidade: 'São Paulo',
    endereco: 'Rua 1',
    emailNotificacao: 'a@b.com',
    celular: '11999999999',
    tipoWhatsApp: 'E_WHATSAPP' as OpcaoWhatsApp,
    whatsappAuxiliar: undefined,
    nomeSolicitante: '',
    tipo,
  };
}

describe('CreateAppointmentUseCase', () => {
  it('salva paciente e agendamento, envia e-mail e retorna protocolo válido', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    const result = await useCase.execute(baseInput('TRATAMENTO_SEM_CIRURGIA'));

    expect(vi.mocked(patientRepo.save)).toHaveBeenCalledOnce();
    expect(vi.mocked(appointmentRepo.save)).toHaveBeenCalledOnce();
    expect(vi.mocked(emailGateway.send)).toHaveBeenCalledOnce();
    expect(Protocolo.criar(result.protocolo)).toBeInstanceOf(Protocolo);
    expect(result.emailEnviado).toBe(true);
  });

  it('calcula data de cirurgia para tratamento com cirurgia', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await useCase.execute(baseInput('TRATAMENTO_COM_CIRURGIA'));

    const saved = vi.mocked(appointmentRepo.save).mock.calls[0][0];
    expect(saved.dataCirurgia).toBeInstanceOf(Date);
  });
});
