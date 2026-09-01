export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
}

export class DomainError extends Error implements AppError {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
  }
}

export class ValidationError extends DomainError {
  constructor(message = 'Os dados fornecidos são inválidos.') {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Recurso não encontrado.') {
    super('NOT_FOUND', message, 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message = 'Já existe um registro com estes dados.') {
    super('CONFLICT', message, 409);
  }
}

export class AuthenticationError extends DomainError {
  constructor(message = 'Não autorizado.') {
    super('UNAUTHENTICATED', message, 401);
  }
}

export class RepositoryError extends DomainError {
  constructor(message = 'Falha ao acessar os dados.') {
    super('REPOSITORY_ERROR', message, 500);
  }
}

export class EmailError extends DomainError {
  constructor(message = 'Falha ao enviar o e-mail.') {
    super('EMAIL_ERROR', message, 502);
  }
}

export class UnexpectedError extends DomainError {
  constructor(message = 'Ocorreu um erro inesperado. Tente novamente mais tarde.') {
    super('UNEXPECTED_ERROR', message, 500);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof DomainError;
}

export function toAppError(error: unknown): AppError {
  if (error instanceof DomainError) {
    return error;
  }

  return new UnexpectedError();
}
