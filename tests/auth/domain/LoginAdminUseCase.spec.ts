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
});
