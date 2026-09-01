import type { EmailTemplate } from '../entities/EmailTemplate';

export interface EmailTemplateRepository {
  findById(id: number): Promise<EmailTemplate | null>;
  upsert(template: EmailTemplate): Promise<void>;
  registrarEnvioPontual(assunto: string, corpo: string): Promise<void>;
}
