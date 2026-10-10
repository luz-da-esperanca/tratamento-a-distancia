import { describe, it, expect } from 'vitest';
import { formatDateMask, toISODate, isNascimentoValido } from '@/src/shared/utils/mask';

describe('formatDateMask', () => {
  it.each([
    ['', ''],
    ['1', '1'],
    ['12', '12'],
    ['121', '12/1'],
    ['1211', '12/11'],
    ['12112000', '12/11/2000'],
    ['121120001122', '12/11/2000'],
    ['12a11b2000', '12/11/2000'],
  ])('mascara %s → %s', (entrada, esperado) => {
    expect(formatDateMask(entrada)).toBe(esperado);
  });
});

describe('toISODate', () => {
  it('converte dd/mm/aaaa → aaaa-mm-dd', () => {
    expect(toISODate('10/05/2000')).toBe('2000-05-10');
  });

  it.each([[''], ['10/05/00'], ['2000-05-10'], ['10-05-2000'], ['1/1/2000']])(
    'rejeita %s com string vazia',
    (entrada) => {
      expect(toISODate(entrada)).toBe('');
    },
  );
});

describe('isNascimentoValido', () => {
  it('aceita data passada válida', () => {
    expect(isNascimentoValido('2000-05-10')).toBe(true);
  });

  it('aceita hoje (limite até fim do dia)', () => {
    const hoje = new Date();
    const iso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    expect(isNascimentoValido(iso)).toBe(true);
  });

  it('rejeita amanhã (futura)', () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const iso = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;
    expect(isNascimentoValido(iso)).toBe(false);
  });

  it.each([[''], ['10/05/2000'], ['2000-13-01'], ['1899-12-31'], ['2000-02-30'], ['2026-02-29']])(
    'rejeita %s',
    (entrada) => {
      expect(isNascimentoValido(entrada)).toBe(false);
    },
  );

  it('aceita limite inferior 1900-01-01', () => {
    expect(isNascimentoValido('1900-01-01')).toBe(true);
  });
});
