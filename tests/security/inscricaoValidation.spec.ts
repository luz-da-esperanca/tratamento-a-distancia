import { describe, it, expect, vi } from 'vitest';
import { CreateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { ok } from '@/src/shared/domain/Result';
import type { CreateAppointmentInput } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';

/**
 * Barreira P0: validação server-side do cadastro.
 *
 * `Patient.criar` / `Appointment.criar` rejeitam payload inválido que
 * bypassar a UI, e o use-case valida tudo ANTES de persistir (nenhum
 * paciente órfão). Estes testes falham se qualquer proteção for removida.
 */
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

function baseInput(): CreateAppointmentInput {
  return {
    nomeCompleto: 'Maria Silva',
    dataNascimento: '2000-05-10',
    pais: 'BR',
    estado: 'CE',
    cidade: 'Fortaleza',
    endereco: 'Rua Exemplo, 123',
    emailNotificacao: 'maria@exemplo.com',
    celular: '+5585988888888',
    tipoWhatsApp: 'E_WHATSAPP',
    whatsappAuxiliar: undefined,
    nomeSolicitante: '',
    tipo: 'TRATAMENTO_SEM_CIRURGIA',
  };
}

describe('P0 — validação server-side do cadastro', () => {
  it('rejeita nome completo vazio sem persistir nada', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute({ ...baseInput(), nomeCompleto: '   ' })).rejects.toThrow();
    expect(patientRepo.save).not.toHaveBeenCalled();
    expect(appointmentRepo.save).not.toHaveBeenCalled();
  });

  it('rejeita e-mail de notificação malformado sem persistir nada', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute({ ...baseInput(), emailNotificacao: 'nao-e-email' })).rejects.toThrow();
    expect(patientRepo.save).not.toHaveBeenCalled();
    expect(appointmentRepo.save).not.toHaveBeenCalled();
  });

  it('rejeita celular vazio sem persistir nada', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute({ ...baseInput(), celular: '' })).rejects.toThrow();
    expect(patientRepo.save).not.toHaveBeenCalled();
    expect(appointmentRepo.save).not.toHaveBeenCalled();
  });

  it('rejeita OUTRO_NUMERO sem whatsapp auxiliar sem persistir nada', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(
      useCase.execute({ ...baseInput(), tipoWhatsApp: 'OUTRO_NUMERO', whatsappAuxiliar: '' }),
    ).rejects.toThrow();
    expect(patientRepo.save).not.toHaveBeenCalled();
    expect(appointmentRepo.save).not.toHaveBeenCalled();
  });

  it('rejeita data de nascimento impossível (2000-02-30) sem persistir nada', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute({ ...baseInput(), dataNascimento: '2000-02-30' })).rejects.toThrow();
    expect(patientRepo.save).not.toHaveBeenCalled();
    expect(appointmentRepo.save).not.toHaveBeenCalled();
  });

  it('rejeita data de nascimento futura sem persistir nada', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute({ ...baseInput(), dataNascimento: '2999-01-01' })).rejects.toThrow();
    expect(patientRepo.save).not.toHaveBeenCalled();
    expect(appointmentRepo.save).not.toHaveBeenCalled();
  });
});
