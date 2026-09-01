import { formatDate } from 'date-fns';

export interface ConfirmationEmailData {
  protocolo: string;
  tipo: 'TRATAMENTO_COM_CIRURGIA' | 'TRATAMENTO_SEM_CIRURGIA';
  dataCadastro: Date;
  dataCirurgia?: Date;
  dataNascimento: string;
}

export function buildConfirmationEmail(
  data: ConfirmationEmailData,
): { assunto: string; corpoHtml: string; replyTo: string } {
  const tipoLabel = data.tipo === 'TRATAMENTO_COM_CIRURGIA' ? 'Com Cirurgia' : 'Sem Cirurgia';
  const dataNascimentoFormatada = formatDate(new Date(`${data.dataNascimento}T12:00:00`), 'dd/MM/yyyy');

  const corpoHtml = `<p>Olá,</p>
<p>Seu agendamento foi confirmado com sucesso.</p>
<p>Protocolo: <strong>${data.protocolo}</strong></p>
<p>Data do Cadastro: ${formatDate(data.dataCadastro, 'dd/MM/yyyy')}</p>
<p>Tipo de Tratamento: ${tipoLabel}</p>
${data.dataCirurgia ? `<p>Data Prevista para Cirurgia: <strong>${formatDate(data.dataCirurgia, 'dd/MM/yyyy')}</strong></p>` : ''}
<br />
<p>Para acompanhar seu agendamento, acesse nosso portal e utilize o protocolo fornecido e sua data de nascimento.</p>
<p>Protocolo de acompanhamento: <strong>${data.protocolo}</strong></p>
<p>Data de Nascimento: <strong>${dataNascimentoFormatada}</strong></p>
<br />
<p>Atenciosamente,</p>
<p>Equipe Luz da Esperança</p>`;

  return {
    assunto: `LUZ DA ESPERANÇA | Agendamento Confirmado: Protocolo ${data.protocolo}`,
    corpoHtml,
    replyTo: 'desenvolvimento@luzdaesperanca.org',
  };
}
