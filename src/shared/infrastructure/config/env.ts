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

const adminSchema = z.object({
  ADMIN_ALLOWED_EMAILS: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0),
    )
    .pipe(z.array(z.string().email()).min(1)),
});

const pacienteSessionSchema = z.object({
  PACIENTE_SESSION_SECRET: z.string().min(32),
});

export type SupabaseEnv = z.infer<typeof supabaseSchema>;
export type EmailEnv = z.infer<typeof emailSchema>;
export type CronEnv = z.infer<typeof cronSchema>;
export type AdminEnv = z.infer<typeof adminSchema>;
export type PacienteSessionEnv = z.infer<typeof pacienteSessionSchema>;

let supabaseCache: SupabaseEnv | null = null;
let emailCache: EmailEnv | null = null;
let cronCache: CronEnv | null = null;
let adminCache: AdminEnv | null = null;
let pacienteSessionCache: PacienteSessionEnv | null = null;
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

export function getAdminEnv(): AdminEnv {
  adminCache = parse(adminSchema, adminCache, 'admin');
  return adminCache;
}

export function getPacienteSessionEnv(): PacienteSessionEnv {
  pacienteSessionCache = parse(pacienteSessionSchema, pacienteSessionCache, 'pacienteSession');
  return pacienteSessionCache;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const allowed = getAdminEnv().ADMIN_ALLOWED_EMAILS;
  return allowed.includes(email.trim().toLowerCase());
}
