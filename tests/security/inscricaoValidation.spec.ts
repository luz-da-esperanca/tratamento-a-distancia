import { describe, it, expect, vi } from 'vitest';
import { CreateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { ok } from '@/src/shared/domain/Result';
import type { CreateAppointmentInput } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';

/**
 * FASE 1 — Lacuna P0: ausência de validação server-side no cadastro.
 *
 * `Patient.criar` e `Appointment.criar` não validam nada (só `status`),
 * então `salvarAgendamento` persiste qualquer payload que bypassar a UI.
 * Estes testes usam `it.fails`: passam enquanto a falha existir e
 * QUEBRAM quando a validação for implementada — sinal para remover o
 * marcador e converter em assertions normais.
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

describe('P0 — validação server-side do cadastro (lacuna conhecida)', () => {
  it.fails('rejeita nome completo vazio', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute({ ...baseInput(), nomeCompleto: '   ' })).rejects.toThrow();
  });

  it.fails('rejeita e-mail de notificação malformado', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute({ ...baseInput(), emailNotificacao: 'nao-e-email' })).rejects.toThrow();
  });

  it.fails('rejeita celular vazio', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(useCase.execute({ ...baseInput(), celular: '' })).rejects.toThrow();
  });

  it.fails('rejeita OUTRO_NUMERO sem whatsapp auxiliar', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await expect(
      useCase.execute({ ...baseInput(), tipoWhatsApp: 'OUTRO_NUMERO', whatsappAuxiliar: '' }),
    ).rejects.toThrow();
  });
});
