import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const config = {
  base: '/sepa-position-sizer/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
};

export default defineConfig(config);
