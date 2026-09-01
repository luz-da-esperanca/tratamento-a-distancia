export type StatusAgendamento = 'AGENDADO' | 'FINALIZADO';

export const STATUS_AGENDAMENTO: readonly StatusAgendamento[] = ['AGENDADO', 'FINALIZADO'];

export function isStatusAgendamento(value: unknown): value is StatusAgendamento {
  return typeof value === 'string' && (STATUS_AGENDAMENTO as readonly string[]).includes(value);
}
