import { describe, it, expect } from 'vitest';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { DomainError } from '@/src/shared/domain/errors';

describe('Protocolo', () => {
  it('gerar produz protocolo no formato AGD-AAAA-NNNN', () => {
    const protocolo = Protocolo.gerar(2026);
    expect(protocolo.valor).toMatch(/^AGD-2026-\d{4}$/);
  });

  it('criar normaliza e aceita protocolo válido', () => {
    const protocolo = Protocolo.criar('agd-2026-1234');
    expect(protocolo.valor).toBe('AGD-2026-1234');
  });

  it('criar lança DomainError para protocolo inválido', () => {
    expect(() => Protocolo.criar('XYZ')).toThrow(DomainError);
  });
});
