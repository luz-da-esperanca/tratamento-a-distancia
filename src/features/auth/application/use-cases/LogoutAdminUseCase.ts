import type { AuthGateway } from '@/src/features/auth/domain/gateways/AuthGateway';

export class LogoutAdminUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  execute() {
    return this.authGateway.signOut();
  }
}
