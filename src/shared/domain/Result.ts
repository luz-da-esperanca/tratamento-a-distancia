import type { AppError } from './errors';

export type Ok<T> = { ok: true; data: T };
export type Failure = { ok: false; error: AppError };
export type Result<T> = Ok<T> | Failure;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function failure(error: AppError): Failure {
  return { ok: false, error };
}

export function isOk<T>(result: Result<T>): result is Ok<T> {
  return result.ok;
}
