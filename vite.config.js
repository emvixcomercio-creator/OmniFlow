import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // caminhos relativos: funciona na raiz ou em subpasta (GitHub Pages)
  base: './',
  plugins: [react()],
  server: { port: 5173, host: true },
})
