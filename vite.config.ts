import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load all .env vars (including non-VITE_ prefixed) so secrets are
  // available to define() for the main-process bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
  root: 'src/renderer',
  base: './',
  plugins: [
    react(),
    electron([
      {
        entry: path.resolve(__dirname, 'src/main/main.ts'),
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron'],
              output: { entryFileNames: '[name].js' },
            },
          },
          resolve: {
            alias: {
              '@shared': path.resolve(__dirname, 'src/shared'),
            },
          },
          // Bake the OpenAI key into the compiled main.js at build time.
          // process.env is not populated inside the MAS app bundle.
          define: {
            'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY ?? ''),
          },
        },
      },
      {
        entry: path.resolve(__dirname, 'src/main/preload.ts'),
        onstart(args) { args.reload() },
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron'],
              output: { entryFileNames: '[name].js' },
            },
          },
        },
      },
      {
        entry: path.resolve(__dirname, 'src/main/messengerPreload.ts'),
        onstart(args) { args.reload() },
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron'],
              output: { entryFileNames: '[name].js' },
            },
          },
        },
      },
    ]),
  ],
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  }
})