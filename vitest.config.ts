/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'server/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/domain/**',
        'src/db/repositories/**',
        'server/validation/**',
        'server/routes/**',
      ],
      exclude: ['src/**/*.test.*', 'src/test/**', 'server/**/*.test.*'],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 55,
        lines: 70,
      },
    },
  },
});
