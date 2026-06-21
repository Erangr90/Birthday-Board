import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Shared proxy so the built app (`vite preview`, production) forwards `/api`
// to the internal-only API exactly like the dev server does. Without this on
// `preview`, production API calls would 404 because the API has no public port.
const apiProxy = {
  '/api': {
    target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
    changeOrigin: true,
    // Forward the real client IP as X-Forwarded-For so the API can rate
    // limit per real client instead of per proxy. The API only trusts this
    // header from the private-network proxy (see server.ts trust proxy).
    xfwd: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 5173,
    },
    watch: {
      usePolling: true,
    },
    proxy: apiProxy,
  },
  build: {
    // Never ship source maps in production, so the app's logic is not trivially
    // readable in the browser dev tools.
    sourcemap: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: apiProxy,
    // Security headers for the built app served by `vite preview` in production.
    // Sent as real HTTP headers (stronger than a <meta> tag, and CSP this way
    // supports frame-ancestors). They are intentionally NOT set on the dev
    // server because script-src 'self' would block Vite's HMR/Fast-Refresh.
    // 'unsafe-inline' is kept only for styles because react-spinners (the Loader)
    // injects inline styles/keyframes at runtime; scripts stay locked to
    // same-origin files.
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
      // Force HTTPS for two years (browsers remember this), including subdomains.
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
      // Stop MIME sniffing, clickjacking, and referrer leakage from the SPA host.
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    },
  },
})
