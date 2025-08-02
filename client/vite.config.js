import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 4444,
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok.io',
      'globally-wise-wallaby.ngrok-free.app'
    ]
  }
})