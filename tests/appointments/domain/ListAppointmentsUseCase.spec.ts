import { describe, it, expect, vi } from 'vitest';
import { ListAppointmentsUseCase } from '@/src/features/appointments/application/use-cases/ListAppointmentsUseCase';
import {
  makeAppointment,
  makePatient,
  makeProtocolo,
  defaultAppointmentRepo,
  defaultPatientRepo,
} from '@/tests/helpers/factories';

function makeAppointmentById(protocolo: string, pacienteId: string) {
  return makeAppointment({ id: protocolo, protocolo: makeProtocolo(protocolo), pacienteId });
}

describe('ListAppointmentsUseCase', () => {
  it('anexa o paciente de cada agendamento', async () => {
    const appointmentRepo = defaultAppointmentRepo({
      list: vi.fn(async () => [
        makeAppointmentById('AGD-2026-1111', 'pac-1'),
        makeAppointmentById('AGD-2026-2222', 'pac-2'),
      ]),
    });
    const patientRepo = defaultPatientRepo({
      findById: vi.fn(async (id: string) =>
        id === 'pac-1' ? makePatient({ id: 'pac-1', nomeCompleto: 'Maria' }) : null,
      ),
    });
    const useCase = new ListAppointmentsUseCase(appointmentRepo, patientRepo);

    const result = await useCase.execute();

    expect(result.itens).toHaveLength(2);
    expect(result.itens[0].paciente?.nomeCompleto).toBe('Maria');
    expect(result.itens[1].paciente).toBeNull();
  });

  it('retorna lista vazia quando não há agendamentos', async () => {
    const appointmentRepo = defaultAppointmentRepo();
    const patientRepo = defaultPatientRepo();
    const useCase = new ListAppointmentsUseCase(appointmentRepo, patientRepo);

    const result = await useCase.execute();

    expect(result.itens).toEqual([]);
    expect(vi.mocked(patientRepo.findById)).not.toHaveBeenCalled();
  });
});
