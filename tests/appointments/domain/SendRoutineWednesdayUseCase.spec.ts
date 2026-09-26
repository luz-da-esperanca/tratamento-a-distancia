import { describe, it, expect, vi } from 'vitest';
import { SendRoutineWednesdayUseCase } from '@/src/features/emails/application/use-cases/SendRoutineWednesdayUseCase';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { failure } from '@/src/shared/domain/Result';
import { DomainError, EmailError } from '@/src/shared/domain/errors';
import {
  makeAppointment,
  makeEmailTemplate,
  defaultAppointmentRepo,
  defaultTemplateRepo,
  okEmailGateway,
} from '@/tests/helpers/factories';

describe('SendRoutineWednesdayUseCase', () => {
  it('usa o template de quarta (id 2) e marca enviouEmailQuarta', async () => {
    const template = makeEmailTemplate(2, 'Quarta', 'C');
    const appointmentRepo = defaultAppointmentRepo({
      findPendingRoutine: vi.fn(async () => [makeAppointment()]),
    });
    const templateRepo = defaultTemplateRepo({ findById: vi.fn(async () => template) });
    const emailGateway = okEmailGateway();

    const useCase = new SendRoutineWednesdayUseCase(appointmentRepo, templateRepo, emailGateway);
    const result = await useCase.execute();

    expect(vi.mocked(templateRepo.findById)).toHaveBeenCalledWith(2);
    expect(vi.mocked(appointmentRepo.findPendingRoutine)).toHaveBeenCalledWith('quarta');
    expect(result).toEqual({ enviados: 1, total: 1 });
    const saved = vi.mocked(appointmentRepo.update).mock.calls[0][0];
    expect(saved.enviouEmailQuarta).toBe(true);
    expect(saved.enviouEmailTerca).toBe(false);
    expect(vi.mocked(emailGateway.send).mock.calls[0][0]).toMatchObject({ assunto: 'Quarta' });
  });

  it('lança quando o template de quarta não existe', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      findPendingRoutine: vi.fn(async () => [makeAppointment()]),
    });
    const templateRepo = defaultTemplateRepo({ findById: vi.fn(async () => null) });
    const emailGateway = okEmailGateway();

    const useCase = new SendRoutineWednesdayUseCase(appointmentRepo, templateRepo, emailGateway);

    await expect(useCase.execute()).rejects.toBeInstanceOf(DomainError);
    expect(vi.mocked(emailGateway.send)).not.toHaveBeenCalled();
  });

  it('não marca flag nem conta enviado quando o gateway falha', async () => {
    const template = makeEmailTemplate(2, 'Quarta', 'C');
    const appointmentRepo = defaultAppointmentRepo({
      findPendingRoutine: vi.fn(async () => [makeAppointment()]),
    });
    const templateRepo = defaultTemplateRepo({ findById: vi.fn(async () => template) });
    const emailGateway: EmailGateway = { send: vi.fn(async () => failure(new EmailError())) };

    const useCase = new SendRoutineWednesdayUseCase(appointmentRepo, templateRepo, emailGateway);
    const result = await useCase.execute();

    expect(result).toEqual({ enviados: 0, total: 1 });
    expect(vi.mocked(appointmentRepo.update)).not.toHaveBeenCalled();
  });
});
