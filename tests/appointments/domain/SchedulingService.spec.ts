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
});
