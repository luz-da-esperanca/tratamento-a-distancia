import { describe, it, expect, vi } from 'vitest';
import { SendRoutineTuesdayUseCase } from '@/src/features/emails/application/use-cases/SendRoutineTuesdayUseCase';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { ok, failure } from '@/src/shared/domain/Result';
import { DomainError, EmailError } from '@/src/shared/domain/errors';
import {
  makeAppointment,
  makeEmailTemplate,
  defaultAppointmentRepo,
  defaultTemplateRepo,
  okEmailGateway,
} from '@/tests/helpers/factories';

describe('SendRoutineTuesdayUseCase', () => {
  it('envia e-mail e marca a flag quando o template existe', async () => {
    const template = makeEmailTemplate(1, 'T', 'C');
    const appointmentRepo = defaultAppointmentRepo({
      findPendingRoutine: vi.fn(async () => [makeAppointment()]),
    });
    const templateRepo = defaultTemplateRepo({ findById: vi.fn(async () => template) });
    const emailGateway = okEmailGateway();

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

  it('não marca flag nem conta enviado quando o gateway falha (paridade com quarta)', async () => {
    const template = makeEmailTemplate(1, 'T', 'C');
    const appointmentRepo = defaultAppointmentRepo({
      findPendingRoutine: vi.fn(async () => [makeAppointment()]),
    });
    const templateRepo = defaultTemplateRepo({ findById: vi.fn(async () => template) });
    const emailGateway: EmailGateway = { send: vi.fn(async () => failure(new EmailError())) };

    const useCase = new SendRoutineTuesdayUseCase(appointmentRepo, templateRepo, emailGateway);
    const result = await useCase.execute();

    expect(result).toEqual({ enviados: 0, total: 1 });
    expect(vi.mocked(appointmentRepo.update)).not.toHaveBeenCalled();
  });
});
