import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // jsdom 默认不实现 requestAnimationFrame，count-up 这类动画会永远停在第 0 帧
    environmentOptions: {
      jsdom: { pretendToBeVisual: true },
    },
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
  },
})
