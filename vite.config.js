import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    // Leading dot = wildcard subdomain match. This covers Render's
    // auto-generated *.onrender.com URL (and stays valid even if the
    // random subdomain changes on a future redeploy).
    allowedHosts: ['.onrender.com'],
  },
})
