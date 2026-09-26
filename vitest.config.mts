import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.spec.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      // Trava de catraca (baseline Fase 5: lines ~84, branches ~71,
      // functions ~77, statements ~84). Só sobe, nunca desce.
      thresholds: {
        lines: 82,
        branches: 69,
        functions: 75,
        statements: 82,
      },
    },
  },
});
