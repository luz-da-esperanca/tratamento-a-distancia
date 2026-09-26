import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationError, UnexpectedError } from '@/src/shared/domain/errors';
import type { FormInscricao } from '@/src/features/appointments/presentation/actions/inscricao.actions';

const execute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeCreateAppointmentUseCase: vi.fn(async () => ({ execute })),
}));

import { salvarAgendamento } from '@/src/features/appointments/presentation/actions/inscricao.actions';
import { makeCreateAppointmentUseCase } from '@/src/shared/infrastructure/composition/container';

function baseForm(): FormInscricao {
  return {
    nomeCompleto: 'Maria Silva',
    dataNascimento: '2000-05-10',
    pais: 'BR',
    estado: 'CE',
    cidade: 'Fortaleza',
    endereco: 'Rua Exemplo, 123',
    emailNotificacao: 'maria@exemplo.com',
    celular: '+5585988888888',
    tipoWhatsApp: 'E_WHATSAPP',
    whatsappAuxiliar: '',
    nomeSolicitante: '',
    tipo: 'TRATAMENTO_SEM_CIRURGIA',
  };
}

describe('salvarAgendamento (server action pública)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('repassa todos os campos ao use-case e retorna protocolo + flag de e-mail', async () => {
    execute.mockResolvedValueOnce({ protocolo: 'AGD-2026-1234', emailEnviado: true });

    const result = await salvarAgendamento(baseForm());

    expect(makeCreateAppointmentUseCase).toHaveBeenCalledOnce();
    expect(execute).toHaveBeenCalledOnce();
    expect(execute.mock.calls[0][0]).toMatchObject({
      nomeCompleto: 'Maria Silva',
      emailNotificacao: 'maria@exemplo.com',
      celular: '+5585988888888',
      tipo: 'TRATAMENTO_SEM_CIRURGIA',
    });
    expect(result).toEqual({ sucesso: true, protocolo: 'AGD-2026-1234', emailEnviado: true });
  });

  it('mapeia erro de domínio para { sucesso: false, erro } com a mensagem original', async () => {
    execute.mockRejectedValueOnce(new ValidationError('E-mail inválido.'));

    const result = await salvarAgendamento(baseForm());

    expect(result).toEqual({ sucesso: false, erro: 'E-mail inválido.' });
  });

  it('não vaza detalhes de erro inesperado (mensagem genérica)', async () => {
    execute.mockRejectedValueOnce(new Error('postgres connection string segredo-xyz'));

    const result = await salvarAgendamento(baseForm());

    expect(result.sucesso).toBe(false);
    expect(result.erro).toBe(new UnexpectedError().message);
    expect(result.erro).not.toContain('segredo-xyz');
  });
});
