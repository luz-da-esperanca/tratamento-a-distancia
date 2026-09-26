import { describe, it, expect, vi } from 'vitest';
import { SendSurgeryAlertsUseCase } from '@/src/features/emails/application/use-cases/SendSurgeryAlertsUseCase';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { ok, failure } from '@/src/shared/domain/Result';
import { EmailError } from '@/src/shared/domain/errors';
import { defaultAppointmentRepo } from '@/tests/helpers/factories';

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

  it.each([
    [15, 'Atualização do seu Tratamento: Falta(m) 15 dia(s)'],
    [7, 'Atualização do seu Tratamento: Falta(m) 7 dia(s)'],
    [3, 'Atualização do seu Tratamento: Falta(m) 3 dia(s)'],
    [0, 'É Hoje! Orientações finais para sua Cirurgia Espiritual'],
  ])('envia no marco de %i dias com o assunto correspondente', async (dias, assunto) => {
    const appointmentRepo = defaultAppointmentRepo({
      findUpcomingSurgeryAlerts: vi.fn(async () => [makeSurgical(dias)]),
    });
    const emailGateway: EmailGateway = { send: vi.fn(async () => ok({ id: 'x' })) };

    const result = await new SendSurgeryAlertsUseCase(appointmentRepo, emailGateway).execute();

    expect(result.alertasEnviados).toBe(1);
    expect(vi.mocked(emailGateway.send).mock.calls[0][0]).toMatchObject({ assunto });
  });

  it('pula candidato sem dataCirurgia sem falhar', async () => {
    const semData = Appointment.reconstituir({
      id: 'AGD-2026-3333',
      protocolo: Protocolo.criar('AGD-2026-3333'),
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
    });
    const appointmentRepo = defaultAppointmentRepo({
      findUpcomingSurgeryAlerts: vi.fn(async () => [semData]),
    });
    const emailGateway: EmailGateway = { send: vi.fn(async () => ok({ id: 'x' })) };

    const result = await new SendSurgeryAlertsUseCase(appointmentRepo, emailGateway).execute();

    expect(result.alertasEnviados).toBe(0);
    expect(vi.mocked(emailGateway.send)).not.toHaveBeenCalled();
  });

  it('falha do gateway não conta alerta e continua os demais', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findUpcomingSurgeryAlerts: vi.fn(async () => [makeSurgical(7), makeSurgical(7)]),
    });
    const emailGateway: EmailGateway = {
      send: vi
        .fn()
        .mockResolvedValueOnce(failure(new EmailError()))
        .mockResolvedValueOnce(ok({ id: 'x' })),
    };

    const result = await new SendSurgeryAlertsUseCase(appointmentRepo, emailGateway).execute();

    expect(result.alertasEnviados).toBe(1);
    expect(vi.mocked(emailGateway.send)).toHaveBeenCalledTimes(2);
  });
});
