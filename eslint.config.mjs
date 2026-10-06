import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    settings: {
      next: {
        rootDir: 'apps/web/',
      },
    },
  },
  prettier,
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/out/**',
    '**/dist/**',
    '**/coverage/**',
    '**/next-env.d.ts',
  ]),
]);
