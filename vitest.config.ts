import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    coverage: {
      // Use the built-in V8 coverage provider to avoid optional external
      // dependencies like `c8` which can cause resolve errors in some
      // environments. Change to 'c8' if you specifically need it and have
      // installed the package.
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
    },
  },
})
