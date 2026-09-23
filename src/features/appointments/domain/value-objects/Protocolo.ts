import { randomInt } from 'node:crypto';
import { DomainError } from '@/src/shared/domain/errors';

const PROTOCOLO_REGEX = /^AGD-\d{4}-\d{4}$/;

export class Protocolo {
  private constructor(private readonly value: string) {}

  static criar(valor: string): Protocolo {
    const normalizado = valor.trim().toUpperCase();
    if (!PROTOCOLO_REGEX.test(normalizado)) {
      throw new DomainError('INVALID_PROTOCOL', `Protocolo inválido: ${valor}`);
    }
    return new Protocolo(normalizado);
  }

  static gerar(ano: number): Protocolo {
    const sequencial = String(randomInt(1000, 10000));
    return new Protocolo(`AGD-${ano}-${sequencial}`);
  }

  get valor(): string {
    return this.value;
  }

  equals(outro: Protocolo): boolean {
    return this.value === outro.value;
  }

  toString(): string {
    return this.value;
  }
}
