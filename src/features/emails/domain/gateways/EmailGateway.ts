import type { Result } from '@/src/shared/domain/Result';

export interface SendEmailInput {
  para: string | string[];
  assunto: string;
  corpoHtml: string;
  replyTo?: string;
}

export interface SendEmailOutput {
  id: string;
}

export interface EmailGateway {
  send(input: SendEmailInput): Promise<Result<SendEmailOutput>>;
}
