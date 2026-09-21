import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';
import vinext from 'vinext';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: '_next/static/release-2/[name]-[hash][extname]',
      },
    },
  },
  css: { postcss: { plugins: [] } },
  plugins: [
    {
      name: 'jeverative-client-release-assets',
      enforce: 'post',
      configEnvironment(name) {
        if (name !== 'client') return;
        // New URLs recover clients that cached immutable 404s in earlier builds.
        return {
          build: {
            rollupOptions: {
              output: {
                entryFileNames: '_next/static/release-2/[name]-[hash].js',
                chunkFileNames: '_next/static/release-2/[name]-[hash].js',
              },
            },
          },
        };
      },
    },
    tailwindcss(),
    vinext(),
    nitro({ preset: 'vercel', vercel: { functions: { maxDuration: 300 } } }),
  ],
});
