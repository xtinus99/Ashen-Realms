import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // Avoid a case-insensitive collision with the canonical public/Assets folder
    // when previewing production builds on Windows.
    assetsDir: 'bundled',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        map: resolve(__dirname, 'map-embed.html'),
      },
    },
  },
});
