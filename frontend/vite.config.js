import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],

    server: {
      port: 3000,
      host: true,
      strictPort: false
    },

    preview: {
      port: 4173,
      host: true,
      strictPort: false
    },

    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      cssMinify: true,
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1200,

      minify: 'esbuild',

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'vendor-ui';
              }
            }
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        }
      }
    },

    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    }
  };
});