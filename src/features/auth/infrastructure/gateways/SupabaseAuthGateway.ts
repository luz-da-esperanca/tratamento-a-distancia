import type { AuthGateway, AdminSession } from '../../domain/gateways/AuthGateway';
import { InvalidCredentialsError } from '../../domain/errors/AuthErrors';
import { failure, ok } from '@/src/shared/domain/Result';
import { createServerSupabaseClient } from '@/src/shared/infrastructure/database/supabase/server';

export class SupabaseAuthGateway implements AuthGateway {
  async signIn(input: { email: string; password: string }) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user) {
      return failure(new InvalidCredentialsError());
    }

    const session: AdminSession = {
      userId: data.user.id,
      email: data.user.email ?? '',
    };

    return ok(session);
  }

  async signOut() {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return ok(undefined);
  }
}
