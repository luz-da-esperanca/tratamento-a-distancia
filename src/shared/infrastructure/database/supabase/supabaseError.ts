import { ConflictError, RepositoryError } from '@/src/shared/domain/errors';

interface PostgresError {
  code?: string;
  message?: string;
  details?: string;
}

function asPostgresError(error: unknown): PostgresError | null {
  if (error && typeof error === 'object' && 'code' in error) {
    return error as PostgresError;
  }
  return null;
}

export function rethrowAsRepositoryError(error: unknown, safeMessage: string): never {
  const pg = asPostgresError(error);

  if (pg?.code === '23505') {
    throw new ConflictError();
  }

  if (pg?.code === '23503') {
    throw new RepositoryError('Os dados relacionados são inválidos.');
  }

  console.error('[repository] Falha na operação no banco de dados:', error);
  throw new RepositoryError(safeMessage);
}
