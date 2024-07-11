import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    }
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
  },
  plugins: [react()],
  server: {
    open: true,
  }
})
