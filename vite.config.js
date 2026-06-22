import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Carbon's Sass triggers a lot of upstream deprecation noise.
        quietDeps: true,
        silenceDeprecations: ['mixed-decls', 'global-builtin', 'color-functions', 'import'],
      },
    },
  },
})
