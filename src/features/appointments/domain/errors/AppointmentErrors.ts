import { DomainError } from '@/src/shared/domain/errors';

export class AppointmentNotFoundError extends DomainError {
  constructor(protocolo?: string) {
    super('APPOINTMENT_NOT_FOUND', `Agendamento não encontrado${protocolo ? `: ${protocolo}` : ''}`, 404);
  }
}

export class AppointmentAlreadyFinalizedError extends DomainError {
  constructor() {
    super('APPOINTMENT_ALREADY_FINALIZED', 'O agendamento já está finalizado.', 409);
  }
}

export class InvalidAppointmentStatusError extends DomainError {
  constructor(status: string) {
    super('INVALID_APPOINTMENT_STATUS', `Status de agendamento inválido: ${status}`, 400);
  }
}

export class InvalidAccessError extends DomainError {
  constructor() {
    super('INVALID_PATIENT_ACCESS', 'Protocolo ou data de nascimento incorretos.', 401);
  }
}
