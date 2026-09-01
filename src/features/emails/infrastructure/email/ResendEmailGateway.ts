import { Resend } from 'resend';
import { EmailError } from '@/src/shared/domain/errors';
import { failure, ok } from '@/src/shared/domain/Result';
import type { Result } from '@/src/shared/domain/Result';
import { getEmailEnv } from '@/src/shared/infrastructure/config/env';
import type { EmailGateway, SendEmailInput, SendEmailOutput } from '../../domain/gateways/EmailGateway';

export class ResendEmailGateway implements EmailGateway {
  private readonly resend?: Resend;
  private readonly from?: string;
  private readonly configured: boolean;

  constructor() {
    const env = getEmailEnv();
    this.configured = env !== null;
    if (env) {
      this.resend = new Resend(env.RESEND_API_KEY);
      this.from = env.RESEND_FROM;
    }
  }

  async send(input: SendEmailInput): Promise<Result<SendEmailOutput>> {
    if (!this.configured || !this.resend || !this.from) {
      console.warn(
        '[email] RESEND_API_KEY/RESEND_FROM ausentes — e-mail de notificação não enviado.',
      );
      return failure(new EmailError('E-mail não configurado'));
    }

    const destinatarios = Array.isArray(input.para) ? input.para : [input.para];

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: destinatarios,
        replyTo: input.replyTo,
        subject: input.assunto,
        html: input.corpoHtml,
      });

      if (error) {
        console.error('[resend] Falha no envio de e-mail:', error);
        return failure(new EmailError('Falha ao enviar o e-mail de notificação.'));
      }

      return ok({ id: data?.id ?? 'desconhecido' });
    } catch (e) {
      console.error('[resend] Exceção no envio de e-mail:', e);
      return failure(new EmailError('Falha ao enviar o e-mail de notificação.'));
    }
  }
}
