import { describe, it, expect, vi, beforeEach } from 'vitest';

const SECRET = '0123456789abcdef0123456789abcdef';

vi.stubEnv('PACIENTE_SESSION_SECRET', SECRET);

import {
  createPacienteSession,
  verifyPacienteSession,
} from '@/src/shared/infrastructure/security/pacienteSession';

describe('P0.2 paciente_session HMAC', () => {
  beforeEach(() => {
    vi.stubEnv('PACIENTE_SESSION_SECRET', SECRET);
  });

  it('cookie válido funciona', () => {
    const value = createPacienteSession('AGD-2026-1234');
    expect(verifyPacienteSession(value, 'AGD-2026-1234')).toBe(true);
  });

  it('cookie alterado manualmente falha', () => {
    const value = createPacienteSession('AGD-2026-1234');
    const tampered = `${value.slice(0, -1)}${value.endsWith('A') ? 'B' : 'A'}`;
    expect(verifyPacienteSession(tampered, 'AGD-2026-1234')).toBe(false);
  });

  it('protocolo diferente falha', () => {
    const value = createPacienteSession('AGD-2026-1234');
    expect(verifyPacienteSession(value, 'AGD-2026-9999')).toBe(false);
  });

  it('assinatura inválida falha', () => {
    expect(verifyPacienteSession('AGD-2026-1234.123.assinatura-invalida', 'AGD-2026-1234')).toBe(false);
  });

  it('formato legado sem assinatura falha', () => {
    expect(verifyPacienteSession('AGD-2026-1234', 'AGD-2026-1234')).toBe(false);
  });

  it('sessão expirada falha', () => {
    const value = createPacienteSession('AGD-2026-1234');
    const parts = value.split('.');
    const expiredTimestamp = (Date.now() - 3 * 60 * 60 * 1000).toString();
    const expiredValue = `${parts[0]}.${expiredTimestamp}.${parts[2]}`;
    expect(verifyPacienteSession(expiredValue, 'AGD-2026-1234')).toBe(false);
  });
});
