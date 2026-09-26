import { describe, it, expect } from 'vitest';
import { calcularUltimaSextaDoMes, validarAntecedencia15Dias } from '@/src/features/appointments/domain/services/SchedulingService';

describe('SchedulingService', () => {
  it('calcularUltimaSextaDoMes retorna a última sexta de agosto/2026', () => {
    const ref = new Date('2026-08-27T12:00:00');
    const result = calcularUltimaSextaDoMes(ref);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(7); // agosto (0-index)
    expect(result.getDate()).toBe(28); // sexta-feira 28/08/2026
    expect(result.getDay()).toBe(5); // sexta-feira
  });

  it('validarAntecedencia15Dias mantém o mês atual quando há 15 dias ou mais', () => {
    const cadastro = new Date('2026-08-01T12:00:00');
    const result = validarAntecedencia15Dias(cadastro);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(7); // agosto
    expect(result.getDate()).toBe(28);
  });

  it('validarAntecedencia15Dias empurra para o mês seguinte quando faltam menos de 15 dias', () => {
    const cadastro = new Date('2026-08-20T12:00:00');
    const result = validarAntecedencia15Dias(cadastro);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(8); // setembro
    expect(result.getDate()).toBe(25); // última sexta de setembro/2026
    expect(result.getDay()).toBe(5);
  });

  it('borda exata: faltando 15 dias mantém o mês atual (< 15 empurra)', () => {
    // A última sexta é calculada à 00:00 e differenceInDays trunca: com
    // cadastro ao meio-dia, dia 12 → 15 dias (mantém), dia 13 → 14 (empurra).
    const noLimite = validarAntecedencia15Dias(new Date('2026-08-12T12:00:00'));
    expect(noLimite.getMonth()).toBe(7);
    expect(noLimite.getDate()).toBe(28);

    const abaixo = validarAntecedencia15Dias(new Date('2026-08-13T12:00:00'));
    expect(abaixo.getMonth()).toBe(8);
    expect(abaixo.getDate()).toBe(25);
  });

  it('virada de ano: dezembro sem antecedência cai na última sexta de janeiro', () => {
    // última sexta de dez/2026 = dia 25; cadastro dia 20 → diferença = 5
    const result = validarAntecedencia15Dias(new Date('2026-12-20T12:00:00'));
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0); // janeiro
    expect(result.getDate()).toBe(29); // última sexta de jan/2027
    expect(result.getDay()).toBe(5);
  });

  it('calcularUltimaSextaDoMes quando o último dia já é sexta', () => {
    // 31/07/2026 é sexta-feira
    const result = calcularUltimaSextaDoMes(new Date('2026-07-15T12:00:00'));
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(31);
    expect(result.getDay()).toBe(5);
  });
});
