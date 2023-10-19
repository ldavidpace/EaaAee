import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  css: {
    modules: {
      generateScopedNames: (name, filename) => `${filename}_${name}`,
    }
  },
  plugins: [react()],
})
