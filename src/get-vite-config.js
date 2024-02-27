import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import eslint from 'vite-plugin-eslint'
import webExtension from 'vite-plugin-web-extension'

import getManifest from './get-manifest.js'

export default ({ browser = 'firefox' } = {}) =>
  defineConfig({
    plugins: [
      webExtension({
        browser,
        manifest: () => getManifest(),
        scriptViteConfig: { plugins: [eslint({ fix: true }), babel()] },
      }),
    ],
  })
