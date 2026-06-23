import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Served from https://ddluc.github.io/roth-ira-calculator/ — Pages uses a
  // repo subpath, so assets must be requested relative to it.
  base: '/roth-ira-calculator/',
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
