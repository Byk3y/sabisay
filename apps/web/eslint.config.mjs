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
    },
  },
];

export default eslintConfig;
