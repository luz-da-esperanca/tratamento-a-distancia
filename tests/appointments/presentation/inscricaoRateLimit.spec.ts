import { describe, it, expect, vi } from 'vitest';
import type { FormInscricao } from '@/src/features/appointments/presentation/actions/inscricao.actions';

const execute = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeCreateAppointmentUseCase: vi.fn(async () => ({ execute })),
  makeRateLimiter: vi.fn(() => ({ check: vi.fn(async () => ({ allowed: false })) })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '9.9.9.9' })),
}));

import { salvarAgendamento } from '@/src/features/appointments/presentation/actions/inscricao.actions';

describe('salvarAgendamento — throttle', () => {
  it('estourado o limite retorna erro formatado sem alcançar o use-case', async () => {
    const form: FormInscricao = {
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

    const result = await salvarAgendamento(form);

    expect(result).toEqual({
      sucesso: false,
      erro: 'Muitas tentativas. Aguarde um minuto e tente novamente.',
    });
    expect(execute).not.toHaveBeenCalled();
  });
});
