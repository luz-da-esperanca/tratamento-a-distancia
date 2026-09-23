import { createHmac, timingSafeEqual } from 'node:crypto';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import { getPacienteSessionEnv } from '@/src/shared/infrastructure/config/env';

export const PACIENTE_SESSION_COOKIE = 'paciente_session';
export const PACIENTE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 2;
export const PACIENTE_SESSION_MAX_AGE_MS = PACIENTE_SESSION_MAX_AGE_SECONDS * 1000;
const CLOCK_SKEW_MS = 60 * 1000;

function sign(protocolo: string, timestamp: string): string {
  const { PACIENTE_SESSION_SECRET } = getPacienteSessionEnv();
  return createHmac('sha256', PACIENTE_SESSION_SECRET).update(`${protocolo}.${timestamp}`).digest('base64url');
}

export function createPacienteSession(protocoloValor: string): string {
  const protocolo = Protocolo.criar(protocoloValor).valor;
  const timestamp = Date.now().toString();
  const signature = sign(protocolo, timestamp);
  return `${protocolo}.${timestamp}.${signature}`;
}

export function verifyPacienteSession(cookieValue: string | undefined, expectedProtocolo: string): boolean {
  if (!cookieValue) {
    return false;
  }
  const parts = cookieValue.split('.');
  if (parts.length !== 3) {
    return false;
  }
  const [protocoloValor, timestampValor, signature] = parts;

  let protocolo: Protocolo;
  let expected: Protocolo;
  try {
    protocolo = Protocolo.criar(protocoloValor);
    expected = Protocolo.criar(expectedProtocolo);
  } catch {
    return false;
  }

  if (protocolo.valor !== expected.valor) {
    return false;
  }

  const timestamp = Number(timestampValor);
  if (!Number.isFinite(timestamp)) {
    return false;
  }
  const now = Date.now();
  if (timestamp > now + CLOCK_SKEW_MS) {
    return false;
  }
  if (now - timestamp > PACIENTE_SESSION_MAX_AGE_MS) {
    return false;
  }

  let expectedSignature: string;
  try {
    expectedSignature = sign(protocolo.valor, timestampValor);
  } catch {
    return false;
  }

  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expectedSignature, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
