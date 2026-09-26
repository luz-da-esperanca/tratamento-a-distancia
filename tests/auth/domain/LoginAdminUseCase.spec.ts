import { describe, it, expect, vi } from 'vitest';
import { LoginAdminUseCase } from '@/src/features/auth/application/use-cases/LoginAdminUseCase';
import type { AuthGateway } from '@/src/features/auth/domain/gateways/AuthGateway';
import { ok, failure } from '@/src/shared/domain/Result';
import { InvalidCredentialsError } from '@/src/features/auth/domain/errors/AuthErrors';

describe('LoginAdminUseCase', () => {
  it('repassa o sucesso do gateway', async () => {
    const gateway: AuthGateway = {
      signIn: vi.fn(async () => ok({ userId: '1', email: 'a@b.com' })),
      signOut: vi.fn(async () => ok(undefined)),
    };

    const result = await new LoginAdminUseCase(gateway).execute({ email: 'a', password: 'b' });

    expect(result.ok).toBe(true);
  });

  it('repassa a falha do gateway', async () => {
    const gateway: AuthGateway = {
      signIn: vi.fn(async () => failure(new InvalidCredentialsError())),
      signOut: vi.fn(async () => ok(undefined)),
    };

    const result = await new LoginAdminUseCase(gateway).execute({ email: 'a', password: 'b' });

    expect(result.ok).toBe(false);
  });

  it('encaminha email e password ao gateway sem alterar', async () => {
    const gateway: AuthGateway = {
      signIn: vi.fn(async () => ok({ userId: '1', email: 'admin@exemplo.com' })),
      signOut: vi.fn(async () => ok(undefined)),
    };

    await new LoginAdminUseCase(gateway).execute({ email: 'admin@exemplo.com', password: 's3nha' });

    expect(vi.mocked(gateway.signIn)).toHaveBeenCalledWith({
      email: 'admin@exemplo.com',
      password: 's3nha',
    });
  });

  it('preserva o tipo do erro do gateway (credenciais vs inesperado)', async () => {
    const credError = new InvalidCredentialsError();
    const gateway: AuthGateway = {
      signIn: vi.fn(async () => failure(credError)),
      signOut: vi.fn(async () => ok(undefined)),
    };

    const result = await new LoginAdminUseCase(gateway).execute({ email: 'a', password: 'b' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(credError);
    }
  });
});
