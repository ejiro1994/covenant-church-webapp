import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      // No externalization needed for lenis
      // external: ["@studio-freight/lenis"]
    }
  }
})
