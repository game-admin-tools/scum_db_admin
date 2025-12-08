import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

let version = '0.0.0'
try {
  version = execSync('git describe --tags --abbrev=0 --always').toString().trim()
} catch (e) {
  // console.warn('Git tag not found')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(version)
  }
})
