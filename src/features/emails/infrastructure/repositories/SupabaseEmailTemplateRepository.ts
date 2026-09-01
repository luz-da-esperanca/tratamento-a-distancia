import type { SupabaseClient } from '@supabase/supabase-js';
import { EmailTemplate } from '../../domain/entities/EmailTemplate';
import type { EmailTemplateRepository } from '../../domain/repositories/EmailTemplateRepository';
import type { TipoEmail } from '../../domain/entities/EmailTemplate';
import { rethrowAsRepositoryError } from '@/src/shared/infrastructure/database/supabase/supabaseError';

export class SupabaseEmailTemplateRepository implements EmailTemplateRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: number): Promise<EmailTemplate | null> {
    const { data, error } = await this.client
      .from('template_emails')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return EmailTemplate.reconstituir({
      id: data.id,
      assunto: data.assunto,
      corpo: data.corpo,
      tipo: data.tipo as TipoEmail,
    });
  }

  async upsert(template: EmailTemplate): Promise<void> {
    const { error } = await this.client.from('template_emails').upsert({
      id: template.id,
      assunto: template.assunto,
      corpo: template.corpo,
      tipo: template.tipo,
    });

    if (error) {
      rethrowAsRepositoryError(error, 'Não foi possível salvar o template de e-mail.');
    }
  }

  async registrarEnvioPontual(assunto: string, corpo: string): Promise<void> {
    const { error } = await this.client.from('template_emails').insert({
      assunto,
      corpo,
      tipo: 'PONTUAL',
    });

    if (error) {
      rethrowAsRepositoryError(error, 'Não foi possível registrar o envio pontual.');
    }
  }
}
