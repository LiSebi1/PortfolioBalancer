import { defineConfig } from 'vite';

export default defineConfig({
  base: './',              // << wichtig für Electron (file://)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});