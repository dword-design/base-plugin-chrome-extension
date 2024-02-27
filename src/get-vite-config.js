import { defineConfig } from 'vite'
import webExtension from 'vite-plugin-web-extension'

import getManifest from './get-manifest.js'

export default ({ browser = 'firefox' } = {}) =>
  defineConfig({
    plugins: [webExtension({ browser, manifest: () => getManifest() })],
  })
