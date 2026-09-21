import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';
import vinext from 'vinext';
import { defineConfig } from 'vite';

export default defineConfig({
  css: { postcss: { plugins: [] } },
  plugins: [
    tailwindcss(),
    vinext(),
    nitro({ preset: 'vercel', vercel: { functions: { maxDuration: 300 } } }),
  ],
});
