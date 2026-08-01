import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const backendOrigin =
    env.VITE_BACKEND_ORIGIN || "http://62.171.157.22:8081";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},



      proxy: {
        "/api": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,

          configure(proxy) {
            proxy.on("error", (error) => {
              console.error("[API proxy error]", error.message);
            });
          },
        },
        "/storage": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        "/videos": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        "/thumbnails": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        "/demo": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
