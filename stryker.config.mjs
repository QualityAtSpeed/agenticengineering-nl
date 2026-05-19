/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'pnpm',
  reporters: ['progress', 'clear-text', 'html'],
  plugins: ['@stryker-mutator/vitest-runner', '@stryker-mutator/typescript-checker'],
  testRunner: 'vitest',
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  mutate: ['lib/**/*.ts'],
  coverageAnalysis: 'perTest',
  thresholds: { high: 80, low: 60, break: null },
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  concurrency: 4,
  timeoutMS: 30_000,
};
