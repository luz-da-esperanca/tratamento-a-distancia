import type { Result } from '@/src/shared/domain/Result';

export interface AdminSession {
  userId: string;
  email: string;
}

export interface AuthGateway {
  signIn(input: { email: string; password: string }): Promise<Result<AdminSession>>;
  signOut(): Promise<Result<void>>;
}
