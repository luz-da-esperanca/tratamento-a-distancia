import { describe, it, expect, vi } from 'vitest';
import { CreateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { ConflictError, RepositoryError } from '@/src/shared/domain/errors';
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

function baseInput() {
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
    tipo: 'TRATAMENTO_SEM_CIRURGIA' as const,
  };
}

describe('P0.3 Protocolo retry', () => {
  it('geração mantém formato AGD-AAAA-NNNN', () => {
    const protocolo = Protocolo.gerar(2026);
    expect(protocolo.valor).toMatch(/^AGD-2026-\d{4}$/);
  });

  it('primeiro conflito + segundo sucesso retorna protocolo', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    vi.mocked(appointmentRepo.save)
      .mockRejectedValueOnce(new ConflictError())
      .mockResolvedValueOnce(undefined);
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    const result = await useCase.execute(baseInput());

    expect(Protocolo.criar(result.protocolo)).toBeInstanceOf(Protocolo);
    expect(vi.mocked(appointmentRepo.save)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(patientRepo.save)).toHaveBeenCalledTimes(1);
  });

  it('todos os retries em conflito propagam ConflictError', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    vi.mocked(appointmentRepo.save).mockRejectedValue(new ConflictError());
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute(baseInput())).rejects.toBeInstanceOf(ConflictError);
    expect(vi.mocked(appointmentRepo.save)).toHaveBeenCalledTimes(
      CreateAppointmentUseCase.MAX_PROTOCOLO_ATTEMPTS,
    );
  });

  it('outros erros não entram em retry', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    vi.mocked(appointmentRepo.save).mockRejectedValue(new RepositoryError('falha'));
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute(baseInput())).rejects.toBeInstanceOf(RepositoryError);
    expect(vi.mocked(appointmentRepo.save)).toHaveBeenCalledTimes(1);
  });
});
