import { describe, it, expect, vi } from 'vitest';
import { SendSpecificAlertUseCase } from '@/src/features/emails/application/use-cases/SendSpecificAlertUseCase';
import type { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import {
  makeAppointment,
  makeProtocolo,
  defaultAppointmentRepo,
  defaultTemplateRepo,
  okEmailGateway,
} from '@/tests/helpers/factories';

function makeAppointmentByProtocol(protocolo: string, email: string) {
  return makeAppointment({ id: protocolo, protocolo: makeProtocolo(protocolo), emailNotificacao: email });
}

function buildRepos(found: Record<string, Appointment | null>) {
  const appointmentRepo = defaultAppointmentRepo({
    findByProtocol: vi.fn(async (p: { valor: string }) => found[p.valor] ?? null),
  });
  const templateRepo = defaultTemplateRepo();
  const emailGateway = okEmailGateway();
  return { appointmentRepo, templateRepo, emailGateway };
}

describe('SendSpecificAlertUseCase', () => {
  it('envia para os e-mails dos protocolos encontrados e registra o envio pontual', async () => {
    const { appointmentRepo, templateRepo, emailGateway } = buildRepos({
      'AGD-2026-1111': makeAppointmentByProtocol('AGD-2026-1111', 'a@exemplo.com'),
      'AGD-2026-2222': makeAppointmentByProtocol('AGD-2026-2222', 'b@exemplo.com'),
    });

    const useCase = new SendSpecificAlertUseCase(appointmentRepo, templateRepo, emailGateway);
    const count = await useCase.execute({
      protocolos: ['AGD-2026-1111', 'AGD-2026-2222'],
      assunto: 'Alerta',
      mensagem: '<p>Oi</p>',
    });

    expect(count).toBe(2);
    expect(vi.mocked(emailGateway.send)).toHaveBeenCalledOnce();
    expect(vi.mocked(emailGateway.send).mock.calls[0][0]).toMatchObject({
      para: ['a@exemplo.com', 'b@exemplo.com'],
      assunto: 'Alerta',
      corpoHtml: '<p>Oi</p>',
    });
    expect(vi.mocked(templateRepo.registrarEnvioPontual)).toHaveBeenCalledWith('Alerta', '<p>Oi</p>');
  });

  it('ignora protocolos inexistentes sem falhar', async () => {
    const { appointmentRepo, templateRepo, emailGateway } = buildRepos({
      'AGD-2026-1111': makeAppointmentByProtocol('AGD-2026-1111', 'a@exemplo.com'),
    });

    const useCase = new SendSpecificAlertUseCase(appointmentRepo, templateRepo, emailGateway);
    const count = await useCase.execute({
      protocolos: ['AGD-2026-1111', 'AGD-2026-9999'],
      assunto: 'Alerta',
      mensagem: '<p>Oi</p>',
    });

    expect(count).toBe(1);
    expect(vi.mocked(emailGateway.send).mock.calls[0][0]).toMatchObject({ para: ['a@exemplo.com'] });
  });

  it('não chama o gateway quando nenhum protocolo existe, mas registra o envio', async () => {
    const { appointmentRepo, templateRepo, emailGateway } = buildRepos({});

    const useCase = new SendSpecificAlertUseCase(appointmentRepo, templateRepo, emailGateway);
    const count = await useCase.execute({
      protocolos: ['AGD-2026-9999'],
      assunto: 'Alerta',
      mensagem: '<p>Oi</p>',
    });

    expect(count).toBe(0);
    expect(vi.mocked(emailGateway.send)).not.toHaveBeenCalled();
    expect(vi.mocked(templateRepo.registrarEnvioPontual)).toHaveBeenCalledOnce();
  });
});
