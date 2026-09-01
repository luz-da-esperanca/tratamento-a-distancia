import { describe, it, expect, vi } from 'vitest';
import { SendRoutineTuesdayUseCase } from '@/src/features/emails/application/use-cases/SendRoutineTuesdayUseCase';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailTemplateRepository } from '@/src/features/emails/domain/repositories/EmailTemplateRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { EmailTemplate } from '@/src/features/emails/domain/entities/EmailTemplate';
import { ok } from '@/src/shared/domain/Result';
import { DomainError } from '@/src/shared/domain/errors';

function makeAppointment() {
  return Appointment.reconstituir({
    id: 'AGD-2026-1111',
    protocolo: Protocolo.criar('AGD-2026-1111'),
    pacienteId: 'p',
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

function defaultAppointmentRepo(overrides: Partial<AppointmentRepository> = {}): AppointmentRepository {
  return {
    save: vi.fn(async () => {}),
    findByProtocol: vi.fn(async () => null),
    update: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    list: vi.fn(async () => []),
    findPendingRoutine: vi.fn(async () => []),
    findUpcomingSurgeryAlerts: vi.fn(async () => []),
    resetRoutineFlags: vi.fn(async () => {}),
    ...overrides,
  };
}

function defaultTemplateRepo(overrides: Partial<EmailTemplateRepository> = {}): EmailTemplateRepository {
  return {
    findById: vi.fn(async () => null),
    upsert: vi.fn(async () => {}),
    registrarEnvioPontual: vi.fn(async () => {}),
    ...overrides,
  };
}

describe('SendRoutineTuesdayUseCase', () => {
  it('envia e-mail e marca a flag quando o template existe', async () => {
    const template = EmailTemplate.reconstituir({ id: 1, assunto: 'T', corpo: 'C', tipo: 'PROGRAMADO' });
    const appointmentRepo = defaultAppointmentRepo({
      findPendingRoutine: vi.fn(async () => [makeAppointment()]),
    });
    const templateRepo = defaultTemplateRepo({ findById: vi.fn(async () => template) });
    const emailGateway: EmailGateway = { send: vi.fn(async () => ok({ id: 'x' })) };

    const useCase = new SendRoutineTuesdayUseCase(appointmentRepo, templateRepo, emailGateway);
    const result = await useCase.execute();

    expect(result.enviados).toBe(1);
    expect(vi.mocked(appointmentRepo.update)).toHaveBeenCalledOnce();
    const saved = vi.mocked(appointmentRepo.update).mock.calls[0][0];
    expect(saved.enviouEmailTerca).toBe(true);
    expect(vi.mocked(emailGateway.send)).toHaveBeenCalledOnce();
  });

  it('lança quando o template não existe', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findPendingRoutine: vi.fn(async () => [makeAppointment()]),
    });
    const templateRepo = defaultTemplateRepo({ findById: vi.fn(async () => null) });
    const emailGateway: EmailGateway = { send: vi.fn(async () => ok({ id: 'x' })) };

    const useCase = new SendRoutineTuesdayUseCase(appointmentRepo, templateRepo, emailGateway);

    await expect(useCase.execute()).rejects.toBeInstanceOf(DomainError);
  });
});
