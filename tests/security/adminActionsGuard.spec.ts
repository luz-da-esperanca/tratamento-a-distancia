import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exemplo.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-teste');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-teste');
vi.stubEnv('ADMIN_ALLOWED_EMAILS', 'admin@exemplo.com');
vi.stubEnv('PACIENTE_SESSION_SECRET', 'segredo-de-teste-com-32-chars-123456');

const getUser = vi.fn();

const cookiesGet = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookiesGet })),
}));

vi.mock('@/src/shared/infrastructure/database/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({ auth: { getUser } })),
}));

const listExecute = vi.fn();
const updateExecute = vi.fn();
const deleteExecute = vi.fn();
const alertExecute = vi.fn();
const templatesExecute = vi.fn();
const getByProtocolExecute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeListAppointmentsUseCase: vi.fn(async () => ({ execute: listExecute })),
  makeUpdateAppointmentUseCase: vi.fn(async () => ({ execute: updateExecute })),
  makeDeleteAppointmentUseCase: vi.fn(async () => ({ execute: deleteExecute })),
  makeSendSpecificAlertUseCase: vi.fn(async () => ({ execute: alertExecute })),
  makeSaveEmailTemplatesUseCase: vi.fn(async () => ({ execute: templatesExecute })),
  makeGetAppointmentByProtocolUseCase: vi.fn(async () => ({ execute: getByProtocolExecute })),
}));

import {
  buscarAgendamentos,
  atualizarAgendamento,
  excluirAgendamento,
  buscarAgendamentoPorProtocolo,
} from '@/src/features/appointments/presentation/actions/agendamentos.actions';
import { createPacienteSession } from '@/src/shared/infrastructure/security/pacienteSession';
import { enviarAlertaGeral } from '@/src/features/appointments/presentation/actions/alertas.actions';
import { salvarTemplatesRotina } from '@/src/features/emails/presentation/actions/templates.actions';

function semSessao() {
  getUser.mockResolvedValue({ data: { user: null } });
}

describe('admin actions — fail-closed sem sessão', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    semSessao();
  });

  it('buscarAgendamentos retorna [] sem alcançar o use-case', async () => {
    const result = await buscarAgendamentos();

    expect(result).toEqual([]);
    expect(listExecute).not.toHaveBeenCalled();
  });

  it('atualizarAgendamento falha sem alcançar o use-case', async () => {
    const result = await atualizarAgendamento('AGD-2026-1111', {});

    expect(result.sucesso).toBe(false);
    expect(updateExecute).not.toHaveBeenCalled();
  });

  it('excluirAgendamento falha sem alcançar o use-case', async () => {
    const result = await excluirAgendamento('AGD-2026-1111', 'pac-1');

    expect(result.sucesso).toBe(false);
    expect(deleteExecute).not.toHaveBeenCalled();
  });

  it('enviarAlertaGeral falha sem alcançar o use-case', async () => {
    const result = await enviarAlertaGeral(['AGD-2026-1111'], 'Assunto', '<p>Oi</p>');

    expect(result.sucesso).toBe(false);
    expect(alertExecute).not.toHaveBeenCalled();
  });

  it('salvarTemplatesRotina falha sem alcançar o use-case', async () => {
    const form = new FormData();
    form.set('tercaAssunto', 'T');
    form.set('tercaCorpo', 'C');
    form.set('quartaAssunto', 'Q');
    form.set('quartaCorpo', 'C');

    const result = await salvarTemplatesRotina(form);

    expect(result.sucesso).toBe(false);
    expect(templatesExecute).not.toHaveBeenCalled();
  });
});

describe('trust boundary — buscarAgendamentoPorProtocolo exige sessão válida', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    semSessao();
    cookiesGet.mockReturnValue(undefined);
  });

  function dadosNoUseCase() {
    getByProtocolExecute.mockResolvedValue({
      appointment: {
        protocolo: { valor: 'AGD-2026-1111' },
        pacienteId: 'pac-1',
        dataCadastro: new Date(),
        status: 'AGENDADO',
        emailNotificacao: 'a@b.com',
        celular: '11999999999',
        tipoWhatsapp: 'E_WHATSAPP',
        whatsappAuxiliar: undefined,
        ehIntercessorio: false,
        nomeSolicitante: 'X',
        enviouEmailTerca: false,
        enviouEmailQuarta: false,
        tipo: 'TRATAMENTO_SEM_CIRURGIA',
        dataCirurgia: undefined,
      },
      paciente: null,
    });
  }

  it('chamada direta sem cookie retorna null sem alcançar o use-case', async () => {
    dadosNoUseCase();

    const result = await buscarAgendamentoPorProtocolo('AGD-2026-1111');

    expect(result).toBeNull();
    expect(getByProtocolExecute).not.toHaveBeenCalled();
  });

  it('sessão de outro protocolo retorna null sem alcançar o use-case', async () => {
    dadosNoUseCase();
    cookiesGet.mockReturnValue({
      value: createPacienteSession('AGD-2026-2222'),
    });

    const result = await buscarAgendamentoPorProtocolo('AGD-2026-1111');

    expect(result).toBeNull();
    expect(getByProtocolExecute).not.toHaveBeenCalled();
  });

  it('sessão válida do próprio protocolo retorna os dados', async () => {
    dadosNoUseCase();
    cookiesGet.mockReturnValue({
      value: createPacienteSession('AGD-2026-1111'),
    });

    const result = await buscarAgendamentoPorProtocolo('AGD-2026-1111');

    expect(getByProtocolExecute).toHaveBeenCalledOnce();
    expect(result).not.toBeNull();
    expect(result?.protocolo).toBe('AGD-2026-1111');
  });
});
