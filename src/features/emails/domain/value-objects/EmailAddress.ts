import { DomainError } from '@/src/shared/domain/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailAddress {
  private constructor(private readonly value: string) {}

  static criar(valor: string): EmailAddress {
    const normalizado = valor.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizado)) {
      throw new DomainError('INVALID_EMAIL', `E-mail inválido: ${valor}`);
    }
    return new EmailAddress(normalizado);
  }

  get valor(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
