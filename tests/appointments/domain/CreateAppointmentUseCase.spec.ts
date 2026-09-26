import { describe, it, expect, vi } from 'vitest';
import { CreateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import type { OpcaoWhatsApp } from '@/types/database';
import {
  defaultAppointmentRepo,
  defaultPatientRepo,
  okEmailGateway,
} from '@/tests/helpers/factories';

function buildFakes() {
  const patientRepo = defaultPatientRepo();
  const appointmentRepo = defaultAppointmentRepo();
  const emailGateway = okEmailGateway();
  return { patientRepo, appointmentRepo, emailGateway };
}

function baseInput(tipo: 'TRATAMENTO_COM_CIRURGIA' | 'TRATAMENTO_SEM_CIRURGIA') {
  return {
    nomeCompleto: 'Ana',
    dataNascimento: '1990-05-10',
    pais: 'Brasil',
    estado: 'SP',
    cidade: 'São Paulo',
    endereco: 'Rua 1',
    emailNotificacao: 'a@b.com',
    celular: '11999999999',
    tipoWhatsApp: 'E_WHATSAPP' as OpcaoWhatsApp,
    whatsappAuxiliar: undefined,
    nomeSolicitante: '',
    tipo,
  };
}

describe('CreateAppointmentUseCase', () => {
  it('salva paciente e agendamento, envia e-mail e retorna protocolo válido', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    const result = await useCase.execute(baseInput('TRATAMENTO_SEM_CIRURGIA'));

    expect(vi.mocked(patientRepo.save)).toHaveBeenCalledOnce();
    expect(vi.mocked(appointmentRepo.save)).toHaveBeenCalledOnce();
    expect(vi.mocked(emailGateway.send)).toHaveBeenCalledOnce();
    expect(Protocolo.criar(result.protocolo)).toBeInstanceOf(Protocolo);
    expect(result.emailEnviado).toBe(true);
  });

  it('calcula data de cirurgia para tratamento com cirurgia', async () => {
    const { patientRepo, appointmentRepo, emailGateway } = buildFakes();
    const useCase = new CreateAppointmentUseCase(patientRepo, appointmentRepo, emailGateway);

    await useCase.execute(baseInput('TRATAMENTO_COM_CIRURGIA'));

    const saved = vi.mocked(appointmentRepo.save).mock.calls[0][0];
    expect(saved.dataCirurgia).toBeInstanceOf(Date);
  });
});
