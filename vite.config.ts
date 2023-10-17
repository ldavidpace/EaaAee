import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    modules: {
      generateScopedNames: (name, filename) => `${filename}_${name}`,
    }
  },
  plugins: [react()],
})
