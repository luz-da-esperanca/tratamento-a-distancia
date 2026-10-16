import { describe, it, expect } from 'vitest';
import { buildConfirmationEmail } from '@/src/features/emails/infrastructure/templates/confirmation.template';
import { parseDateOnly } from '@/src/shared/utils/date';

describe('buildConfirmationEmail', () => {
  it('sem cirurgia: assunto com protocolo, tipo Sem Cirurgia e sem linha de cirurgia', () => {
    const email = buildConfirmationEmail({
      protocolo: 'AGD-2026-1234',
      tipo: 'TRATAMENTO_SEM_CIRURGIA',
      dataCadastro: new Date('2026-09-01T12:00:00'),
      dataNascimento: '2000-05-10',
    });

    expect(email.assunto).toBe('LUZ DA ESPERANÇA | Agendamento Confirmado: Protocolo AGD-2026-1234');
    expect(email.corpoHtml).toContain('Tipo de Tratamento: Sem Cirurgia');
    expect(email.corpoHtml).toContain('Protocolo: <strong>AGD-2026-1234</strong>');
    expect(email.corpoHtml).toContain('Data do Cadastro: 01/09/2026');
    expect(email.corpoHtml).toContain('Data de Nascimento: <strong>10/05/2000</strong>');
    expect(email.corpoHtml).not.toContain('Data Prevista para Cirurgia');
    expect(email.replyTo).toBe('desenvolvimento@luzdaesperanca.org');
  });

  it('com cirurgia: inclui data prevista formatada e tipo Com Cirurgia', () => {
    const email = buildConfirmationEmail({
      protocolo: 'AGD-2026-5678',
      tipo: 'TRATAMENTO_COM_CIRURGIA',
      dataCadastro: new Date('2026-09-01T12:00:00'),
      dataCirurgia: parseDateOnly('2026-09-25'),
      dataNascimento: '1990-01-20',
    });

    expect(email.corpoHtml).toContain('Tipo de Tratamento: Com Cirurgia');
    expect(email.corpoHtml).toContain('Data Prevista para Cirurgia: <strong>25/09/2026</strong>');
    expect(email.assunto).toContain('AGD-2026-5678');
  });

  it('sem cirurgia ignora dataCirurgia ausente sem quebrar', () => {
    const email = buildConfirmationEmail({
      protocolo: 'AGD-2026-0001',
      tipo: 'TRATAMENTO_SEM_CIRURGIA',
      dataCadastro: new Date('2026-01-15T12:00:00'),
      dataNascimento: '1985-12-31',
    });

    expect(email.corpoHtml).toContain('Data de Nascimento: <strong>31/12/1985</strong>');
    expect(email.corpoHtml).toContain('Data do Cadastro: 15/01/2026');
  });
});
