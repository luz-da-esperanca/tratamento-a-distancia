import { DomainError } from '@/src/shared/domain/errors';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('INVALID_CREDENTIALS', 'E-mail ou senha incorretos.', 401);
  }
}
