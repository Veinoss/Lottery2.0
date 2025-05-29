import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Bind to all network interfaces, including localhost
    port: 5173,      // Keep the same port as in your Docker setup
    strictPort: true // Ensure the port is strictly used or fail if unavailable
  },
})
