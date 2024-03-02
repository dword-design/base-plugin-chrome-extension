import vue from '@vitejs/plugin-vue'
import P from 'path'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import eslint from 'vite-plugin-eslint'
import webExtension from 'vite-plugin-web-extension'

import getManifest from './get-manifest.js'

process.env.TARGET = process.env.TARGET || 'chrome'

export default defineConfig({
  build: {
    outDir: P.join('dist', process.env.TARGET),
  },
  plugins: [
    vue(),
    webExtension({
      browser: process.env.TARGET,
      manifest: () => getManifest({ browser: process.env.TARGET }),
      scriptViteConfig: { plugins: [eslint({ fix: true }), babel()] },
    }),
  ],
})
