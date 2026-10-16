import { vi } from 'vitest';
import { Appointment, type AppointmentProps } from '@/src/features/appointments/domain/entities/Appointment';
import { Patient, type PatientProps } from '@/src/features/patients/domain/entities/Patient';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { parseDateOnly } from '@/src/shared/utils/date';
import { EmailTemplate } from '@/src/features/emails/domain/entities/EmailTemplate';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import type { EmailTemplateRepository } from '@/src/features/emails/domain/repositories/EmailTemplateRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { ok } from '@/src/shared/domain/Result';

/**
 * Factories e fakes compartilhados dos specs de domínio/application.
 * Centraliza os dubles para que um novo método nos repositórios quebre
 * em um lugar só, em vez de N arquivos.
 */

export function makeProtocolo(valor = 'AGD-2026-1111'): Protocolo {
  return Protocolo.criar(valor);
}

export function makeAppointment(overrides: Partial<AppointmentProps> = {}): Appointment {
  return Appointment.reconstituir({
    id: 'AGD-2026-1111',
    protocolo: makeProtocolo(),
    pacienteId: 'pac-1',
    dataCadastro: new Date('2026-09-01T12:00:00'),
    status: 'AGENDADO',
    emailNotificacao: 'a@b.com',
    celular: '+5585999999999',
    tipoWhatsapp: 'E_WHATSAPP',
    whatsappAuxiliar: undefined,
    ehIntercessorio: false,
    nomeSolicitante: 'Próprio',
    enviouEmailTerca: false,
    enviouEmailQuarta: false,
    tipo: 'TRATAMENTO_SEM_CIRURGIA',
    dataCirurgia: undefined,
    ...overrides,
  });
}

export function makePatient(overrides: Partial<PatientProps> = {}): Patient {
  return Patient.reconstituir({
    id: 'pac-1',
    nomeCompleto: 'Maria Silva',
    dataNascimento: parseDateOnly('2000-05-10'),
    pais: 'BR',
    estado: 'CE',
    cidade: 'Fortaleza',
    endereco: 'Rua Exemplo, 123',
    ...overrides,
  });
}

export function makeEmailTemplate(id: 1 | 2, assunto = 'Assunto', corpo = 'Corpo'): EmailTemplate {
  return EmailTemplate.reconstituir({ id, assunto, corpo, tipo: 'PROGRAMADO' });
}

export function defaultAppointmentRepo(
  overrides: Partial<AppointmentRepository> = {},
): AppointmentRepository {
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

export function defaultPatientRepo(overrides: Partial<PatientRepository> = {}): PatientRepository {
  return {
    save: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    delete: vi.fn(async () => {}),
    ...overrides,
  };
}

export function defaultTemplateRepo(
  overrides: Partial<EmailTemplateRepository> = {},
): EmailTemplateRepository {
  return {
    findById: vi.fn(async () => null),
    upsert: vi.fn(async () => {}),
    registrarEnvioPontual: vi.fn(async () => {}),
    ...overrides,
  };
}

export function okEmailGateway(): EmailGateway {
  return { send: vi.fn(async () => ok({ id: 'x' })) };
}
