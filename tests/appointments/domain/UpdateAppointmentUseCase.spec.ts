import { describe, it, expect, vi } from 'vitest';
import { UpdateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/UpdateAppointmentUseCase';
import type { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import { AppointmentNotFoundError } from '@/src/features/appointments/domain/errors/AppointmentErrors';
import { makeAppointment, defaultAppointmentRepo } from '@/tests/helpers/factories';

function buildRepo(found: Appointment | null) {
  return defaultAppointmentRepo({ findByProtocol: vi.fn(async () => found) });
}

describe('UpdateAppointmentUseCase', () => {
  it('mescla campos parciais preservando o restante', async () => {
    const repo = buildRepo(makeAppointment());
    const useCase = new UpdateAppointmentUseCase(repo);

    await useCase.execute({
      protocolo: 'AGD-2026-1111',
      campos: { status: 'FINALIZADO', celular: '+5585999999999' },
    });

    expect(vi.mocked(repo.update)).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.update).mock.calls[0][0];
    expect(saved.status).toBe('FINALIZADO');
    expect(saved.celular).toBe('+5585999999999');
    expect(saved.emailNotificacao).toBe('a@b.com');
    expect(saved.protocolo.valor).toBe('AGD-2026-1111');
  });

  it('lança AppointmentNotFoundError quando o protocolo não existe', async () => {
    const repo = buildRepo(null);
    const useCase = new UpdateAppointmentUseCase(repo);

    await expect(
      useCase.execute({ protocolo: 'AGD-2026-9999', campos: { status: 'FINALIZADO' } }),
    ).rejects.toBeInstanceOf(AppointmentNotFoundError);
    expect(vi.mocked(repo.update)).not.toHaveBeenCalled();
  });

  it('permite limpar whatsappAuxiliar com valor vazio explícito', async () => {
    const repo = buildRepo(makeAppointment());
    const useCase = new UpdateAppointmentUseCase(repo);

    await useCase.execute({ protocolo: 'AGD-2026-1111', campos: { whatsappAuxiliar: '' } });

    const saved = vi.mocked(repo.update).mock.calls[0][0];
    expect(saved.whatsappAuxiliar).toBe('');
  });
});
