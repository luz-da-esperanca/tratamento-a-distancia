import { describe, it, expect, vi } from 'vitest';
import { SaveEmailTemplatesUseCase } from '@/src/features/emails/application/use-cases/SaveEmailTemplatesUseCase';
import { defaultTemplateRepo, defaultAppointmentRepo } from '@/tests/helpers/factories';

function buildRepos() {
  const templateRepo = defaultTemplateRepo();
  const appointmentRepo = defaultAppointmentRepo();
  return { templateRepo, appointmentRepo };
}

describe('SaveEmailTemplatesUseCase', () => {
  it('salva templates de terça (id 1) e quarta (id 2) como PROGRAMADO e reseta flags', async () => {
    const { templateRepo, appointmentRepo } = buildRepos();
    const useCase = new SaveEmailTemplatesUseCase(templateRepo, appointmentRepo);

    await useCase.execute({
      tercaAssunto: 'Terça',
      tercaCorpo: '<p>T</p>',
      quartaAssunto: 'Quarta',
      quartaCorpo: '<p>Q</p>',
    });

    expect(vi.mocked(templateRepo.upsert)).toHaveBeenCalledTimes(2);
    const [terca, quarta] = vi.mocked(templateRepo.upsert).mock.calls.map(([t]) => t);
    expect(terca.id).toBe(1);
    expect(terca.assunto).toBe('Terça');
    expect(terca.tipo).toBe('PROGRAMADO');
    expect(quarta.id).toBe(2);
    expect(quarta.assunto).toBe('Quarta');
    expect(quarta.tipo).toBe('PROGRAMADO');
    expect(vi.mocked(appointmentRepo.resetRoutineFlags)).toHaveBeenCalledOnce();
  });
});
