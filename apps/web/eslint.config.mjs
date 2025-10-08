import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/lib/__tests__/**',
      'src/scripts/**',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/lib/env.client.ts',
      'src/lib/env.server.ts',
      'src/app/api/**/*',
      'src/lib/session.ts',
      'src/lib/supabase-server.ts',
      'src/lib/__tests__/**',
      'src/scripts/**',
    ],
    rules: {
      // Flag process.env usage in client components (except in env.client.ts)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[object.object.name="process"][object.property.name="env"]',
          message: 'Direct process.env usage is not allowed in client components. Use clientEnv from @/lib/env.client instead.',
        },
      ],
      // Make these warnings instead of errors for now
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-undef': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'warn',
      'no-empty': 'warn',
      'no-constant-condition': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-case-declarations': 'warn',
    },
  },
];

export default eslintConfig;
