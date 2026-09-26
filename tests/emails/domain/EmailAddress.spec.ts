import { describe, it, expect } from 'vitest';
import { EmailAddress } from '@/src/features/emails/domain/value-objects/EmailAddress';
import { DomainError } from '@/src/shared/domain/errors';

describe('EmailAddress', () => {
  it('normaliza trim + caixa baixa', () => {
    const email = EmailAddress.criar('  Maria@Exemplo.COM ');

    expect(email.valor).toBe('maria@exemplo.com');
    expect(email.toString()).toBe('maria@exemplo.com');
  });

  it('aceita subdomínio e sinais comuns', () => {
    expect(EmailAddress.criar('nome.sobrenome+tag@mail.exemplo.com.br').valor).toBe(
      'nome.sobrenome+tag@mail.exemplo.com.br',
    );
  });

  it.each([['sem-arroba'], ['a@'], ['@b.com'], ['a@b'], ['a b@c.com'], ['']])(
    'rejeita %s com DomainError INVALID_EMAIL',
    (valor) => {
      try {
        EmailAddress.criar(valor);
        expect.unreachable('deveria lançar DomainError');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).code).toBe('INVALID_EMAIL');
      }
    },
  );
});
