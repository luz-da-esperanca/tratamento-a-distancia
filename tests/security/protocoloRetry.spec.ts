import { describe, it, expect, vi } from 'vitest';
import { CreateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { ConflictError, RepositoryError } from '@/src/shared/domain/errors';
import type { OpcaoWhatsApp } from '@/types/database';
import {
  defaultAppointmentRepo,
  defaultPatientRepo,
  okEmailGateway,
} from '@/tests/helpers/factories';

function buildFakes() {
  const patientRepo = defaultPatientRepo();
  const appointmentRepo = defaultAppointmentRepo();
  const emailGateway = okEmailGateway();
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
    celular: '+5585999999999',
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
