import { describe, it, expect, vi } from 'vitest';
import { SendSurgeryAlertsUseCase } from '@/src/features/emails/application/use-cases/SendSurgeryAlertsUseCase';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { ok } from '@/src/shared/domain/Result';

function makeSurgical(daysFromNow: number) {
  const data = new Date();
  data.setDate(data.getDate() + daysFromNow);
  return Appointment.reconstituir({
    id: 'AGD-2026-2222',
    protocolo: Protocolo.criar('AGD-2026-2222'),
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
    tipo: 'TRATAMENTO_COM_CIRURGIA',
    dataCirurgia: data,
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

describe('SendSurgeryAlertsUseCase', () => {
  it('envia alerta no marco exato de 15 dias', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findUpcomingSurgeryAlerts: vi.fn(async () => [makeSurgical(15)]),
    });
    const emailGateway: EmailGateway = { send: vi.fn(async () => ok({ id: 'x' })) };

    const result = await new SendSurgeryAlertsUseCase(appointmentRepo, emailGateway).execute();

    expect(result.alertasEnviados).toBe(1);
    expect(vi.mocked(emailGateway.send)).toHaveBeenCalledOnce();
  });

  it('não envia fora dos marcos (5 dias)', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findUpcomingSurgeryAlerts: vi.fn(async () => [makeSurgical(5)]),
    });
    const emailGateway: EmailGateway = { send: vi.fn(async () => ok({ id: 'x' })) };

    const result = await new SendSurgeryAlertsUseCase(appointmentRepo, emailGateway).execute();

    expect(result.alertasEnviados).toBe(0);
    expect(vi.mocked(emailGateway.send)).not.toHaveBeenCalled();
  });
});
