import { defineConfig } from 'vitest/config';
import base from './vitest.config';

if (!process.env.WEBSITE_TEST_ENV_DIR) {
  throw new Error('Use the isolated website harness to provide an empty environment directory');
}

export default defineConfig({
  ...base,
  envDir: process.env.WEBSITE_TEST_ENV_DIR,
  test: {
    ...base.test,
    include: ['server/website/__tests__/*.integration.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
