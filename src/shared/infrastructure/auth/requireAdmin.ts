import { AuthenticationError } from '@/src/shared/domain/errors';
import { getAdminEnv } from '@/src/shared/infrastructure/config/env';
import { createServerSupabaseClient } from '@/src/shared/infrastructure/database/supabase/server';

export interface AdminIdentity {
  userId: string;
  email: string;
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new AuthenticationError('Não autorizado.');
  }

  const allowed = getAdminEnv().ADMIN_ALLOWED_EMAILS;
  if (!allowed.includes(user.email.trim().toLowerCase())) {
    throw new AuthenticationError('Não autorizado.');
  }

  return { userId: user.id, email: user.email };
}
