import { describe, it, expect, vi } from 'vitest';
import { LogoutAdminUseCase } from '@/src/features/auth/application/use-cases/LogoutAdminUseCase';
import type { AuthGateway } from '@/src/features/auth/domain/gateways/AuthGateway';
import { ok } from '@/src/shared/domain/Result';

describe('LogoutAdminUseCase', () => {
  it('delega o encerramento de sessão ao gateway e repassa o resultado', async () => {
    const gateway: AuthGateway = {
      signIn: vi.fn(async () => ok({ userId: 'u', email: 'a@b.com' })),
      signOut: vi.fn(async () => ok(undefined)),
    };
    const useCase = new LogoutAdminUseCase(gateway);

    const result = await useCase.execute();

    expect(vi.mocked(gateway.signOut)).toHaveBeenCalledOnce();
    expect(result).toEqual(ok(undefined));
  });
});
