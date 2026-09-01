import type { AuthGateway } from '@/src/features/auth/domain/gateways/AuthGateway';

export interface LoginAdminInput {
  email: string;
  password: string;
}

export class LoginAdminUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  execute(input: LoginAdminInput) {
    return this.authGateway.signIn(input);
  }
}
