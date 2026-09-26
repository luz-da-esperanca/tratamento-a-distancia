import { describe, it, expect } from 'vitest';
import {
  isStatusAgendamento,
  STATUS_AGENDAMENTO,
} from '@/src/features/appointments/domain/value-objects/StatusAgendamento';

describe('StatusAgendamento', () => {
  it('lista os dois status válidos', () => {
    expect([...STATUS_AGENDAMENTO]).toEqual(['AGENDADO', 'FINALIZADO']);
  });

  it.each([['AGENDADO'], ['FINALIZADO']])('aceita %s', (valor) => {
    expect(isStatusAgendamento(valor)).toBe(true);
  });

  it.each([['agendado'], ['FINALIZADO '], [''], [null], [undefined], [42], [{}]])(
    'rejeita %s (case-sensitive, sem trim, sem não-string)',
    (valor) => {
      expect(isStatusAgendamento(valor)).toBe(false);
    },
  );
});
