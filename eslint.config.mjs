import js from '@eslint/js';
import ts from 'typescript-eslint';
import security from 'eslint-plugin-security';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import next from 'eslint-config-next';

// eslint-config-next's first config item bundles the @next/next plugin alongside react/jsx-a11y/import,
// which are incompatible with ESLint 10 flat config. Extract just the @next/next plugin + rules so
// `next build` can detect its plugin and surface Next-specific lints.
const nextCoreItem = next.find((cfg) => cfg.plugins?.['@next/next']);
const nextCoreConfig = nextCoreItem
  ? {
      name: 'next/@next/next',
      plugins: { '@next/next': nextCoreItem.plugins['@next/next'] },
      rules: Object.fromEntries(
        Object.entries(nextCoreItem.rules ?? {}).filter(([rule]) => rule.startsWith('@next/next/')),
      ),
    }
  : null;
const nextConfigs = [
  ...(nextCoreConfig ? [nextCoreConfig] : []),
  ...next.filter((cfg) => cfg !== nextCoreItem && !cfg.plugins?.react),
];

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
