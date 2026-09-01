import { z } from 'zod';

const supabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const emailSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM: z.string().min(1),
});

const cronSchema = z.object({
  CRON_SECRET: z.string().min(1),
});

export type SupabaseEnv = z.infer<typeof supabaseSchema>;
export type EmailEnv = z.infer<typeof emailSchema>;
export type CronEnv = z.infer<typeof cronSchema>;

let supabaseCache: SupabaseEnv | null = null;
let emailCache: EmailEnv | null = null;
let cronCache: CronEnv | null = null;
let emailWarningShown = false;

function parse<T extends z.ZodTypeAny>(schema: T, cache: T['_output'] | null, label: string): T['_output'] {
  if (cache) {
    return cache;
  }
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Variáveis de ambiente inválidas/ausentes (${label}): ${issues}`);
  }
  return parsed.data;
}

function parseOptional<T extends z.ZodTypeAny>(schema: T, cache: T['_output'] | null, label: string): T['_output'] | null {
  if (cache) {
    return cache;
  }
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    if (!emailWarningShown) {
      emailWarningShown = true;
      console.warn(
        `[env] Configuração de e-mail (${label}) ausente ou inválida — e-mails não serão enviados até serem configurados.`,
      );
    }
    return null;
  }
  return parsed.data;
}

export function getSupabaseEnv(): SupabaseEnv {
  supabaseCache = parse(supabaseSchema, supabaseCache, 'supabase');
  return supabaseCache;
}

export function getEmailEnv(): EmailEnv | null {
  emailCache = parseOptional(emailSchema, emailCache, 'email');
  return emailCache;
}

export function getCronEnv(): CronEnv {
  cronCache = parse(cronSchema, cronCache, 'cron');
  return cronCache;
}
