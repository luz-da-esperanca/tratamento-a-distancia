import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-teste');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-teste');
vi.stubEnv('ADMIN_ALLOWED_EMAILS', 'admin@exemplo.com');

const getUser = vi.fn();

vi.mock('@/src/shared/infrastructure/database/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({ auth: { getUser } })),
}));

const listExecute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeListAppointmentsUseCase: vi.fn(async () => ({ execute: listExecute })),
}));

import { buscarAgendamentos } from '@/src/features/appointments/presentation/actions/agendamentos.actions';
import { makeAppointment, makePatient } from '@/tests/helpers/factories';

function makeAppointmentByTipo(
  tipo: 'TRATAMENTO_COM_CIRURGIA' | 'TRATAMENTO_SEM_CIRURGIA',
  pacienteId: string,
) {
  return makeAppointment({
    tipo,
    pacienteId,
    enviouEmailTerca: true,
    dataCirurgia: tipo === 'TRATAMENTO_COM_CIRURGIA' ? new Date('2026-09-25T12:00:00') : undefined,
  });
}

describe('toLegacyAgendamento (via buscarAgendamentos, sessão admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { id: 'u-1', email: 'admin@exemplo.com' } } });
  });

  it('mapeia sem-cirurgia com paciente aninhado em snake_case', async () => {
    listExecute.mockResolvedValueOnce({
      itens: [{ appointment: makeAppointmentByTipo('TRATAMENTO_SEM_CIRURGIA', 'pac-1'), paciente: makePatient() }],
    });

    const [item] = await buscarAgendamentos();

    expect(item.protocolo).toBe('AGD-2026-1111');
    expect(item.tipo).toBe('TRATAMENTO_SEM_CIRURGIA');
    expect(item).not.toHaveProperty('data_cirurgia');
    expect(item.email_notificacao).toBe('a@b.com');
    expect(item.celular).toBe('+5585999999999');
    expect(item.enviou_email_terca).toBe(true);
    expect(item.enviou_email_quarta).toBe(false);
    expect(item.pacientes).toMatchObject({
      nome_completo: 'Maria Silva',
      cidade: 'Fortaleza',
      endereco: 'Rua Exemplo, 123',
    });
  });

  it('mapeia com-cirurgia incluindo data_cirurgia', async () => {
    listExecute.mockResolvedValueOnce({
      itens: [{ appointment: makeAppointmentByTipo('TRATAMENTO_COM_CIRURGIA', 'pac-1'), paciente: makePatient() }],
    });

    const [item] = await buscarAgendamentos();

    expect(item.tipo).toBe('TRATAMENTO_COM_CIRURGIA');
    expect(item).toHaveProperty('data_cirurgia');
  });

  it('mapeia paciente ausente como pacientes: null (sem falhar)', async () => {
    listExecute.mockResolvedValueOnce({
      itens: [{ appointment: makeAppointmentByTipo('TRATAMENTO_SEM_CIRURGIA', 'pac-orphan'), paciente: null }],
    });

    const [item] = await buscarAgendamentos();

    expect(item.pacientes).toBeNull();
    expect(item.protocolo).toBe('AGD-2026-1111');
  });
});
