import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Apenas para Vitest (testes). O build de produção usa Next.js.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
