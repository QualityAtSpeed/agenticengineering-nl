import js from '@eslint/js';
import ts from 'typescript-eslint';
import security from 'eslint-plugin-security';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import next from 'eslint-config-next';

// Filter out the react plugin config from next (it's incompatible with ESLint 10 flat config)
// but keep other Next.js configs like the ones for @next/next
const nextConfigs = next.filter((cfg) => !cfg.plugins?.react);

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...nextConfigs,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooksPlugin,
      security,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react/no-danger': 'error',
      'security/detect-object-injection': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['components/JsonLd.tsx'],
    rules: {
      'react/no-danger': 'off',
    },
  },
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    files: ['css.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'playwright-report/**'],
  },
];
