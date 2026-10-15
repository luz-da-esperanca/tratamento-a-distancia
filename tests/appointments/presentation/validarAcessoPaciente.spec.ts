import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvalidAccessError } from '@/src/features/appointments/domain/errors/AppointmentErrors';
import { PACIENTE_SESSION_COOKIE } from '@/src/shared/infrastructure/security/pacienteSession';

vi.stubEnv('PACIENTE_SESSION_SECRET', 'segredo-de-teste-com-32-chars-123456');

const validateExecute = vi.fn();
const cookieSet = vi.fn();

vi.mock('@/src/shared/infrastructure/composition/container', () => ({
  makeValidatePatientAccessUseCase: vi.fn(async () => ({ execute: validateExecute })),
  makeRateLimiter: vi.fn(() => ({ check: vi.fn(async () => ({ allowed: true })) })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: cookieSet })),
  headers: vi.fn(async () => new Headers()),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

import { validarAcessoPaciente } from '@/src/features/appointments/presentation/actions/agendamentos.actions';

function form(protocolo: string | null, dataNascimento: string | null): FormData {
  const fd = new FormData();
  if (protocolo !== null) fd.set('protocolo', protocolo);
  if (dataNascimento !== null) fd.set('dataNascimento', dataNascimento);
  return fd;
}

describe('validarAcessoPaciente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('campos vazios retornam erro sem consultar o use-case', async () => {
    const result = await validarAcessoPaciente(null, form('', ''));

    expect(result).toEqual({ erro: 'Por favor, preencha todos os campos.' });
    expect(validateExecute).not.toHaveBeenCalled();
  });

  it('campo ausente retorna erro sem consultar o use-case', async () => {
    const result = await validarAcessoPaciente(null, form('AGD-2026-1111', null));

    expect(result).toEqual({ erro: 'Por favor, preencha todos os campos.' });
    expect(validateExecute).not.toHaveBeenCalled();
  });

  it('acesso negado retorna erro genérico (anti-enumeração, sem vazar motivo)', async () => {
    validateExecute.mockRejectedValueOnce(new InvalidAccessError());

    const result = await validarAcessoPaciente(null, form('AGD-2026-1111', '2000-01-01'));

    expect(result).toEqual({ erro: 'Protocolo ou data de nascimento inválidos.' });
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it('sucesso seta cookie de sessão com flags seguras e redireciona ao protocolo', async () => {
    validateExecute.mockResolvedValueOnce({ protocolo: { valor: 'AGD-2026-1111' } });

    const error = await validarAcessoPaciente(null, form('AGD-2026-1111', '2000-05-10')).catch(
      (e) => e,
    );

    expect(validateExecute).toHaveBeenCalledWith({
      protocolo: 'AGD-2026-1111',
      dataNascimento: '2000-05-10',
    });
    expect(cookieSet).toHaveBeenCalledOnce();
    const [name, value, options] = cookieSet.mock.calls[0];
    expect(name).toBe(PACIENTE_SESSION_COOKIE);
    expect(typeof value).toBe('string');
    expect(options).toMatchObject({ httpOnly: true, path: '/tratamento', sameSite: 'strict' });
    expect(String(error)).toContain('NEXT_REDIRECT:/tratamento/AGD-2026-1111');
  });
});
