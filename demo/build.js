import vue from '@vitejs/plugin-vue'
import { defineConfig, build } from 'vite'
import babel from 'vite-plugin-babel'
import eslint from 'vite-plugin-eslint'
import webExtension from 'vite-plugin-web-extension'

build({
  plugins: [
    vue(),
    webExtension({
      manifest: () => ({"name":"Foo","version":"0.0.1","manifest_version":3,"action":{"default_popup":"popup.html"},"content_scripts":[{"js":["content.js"],"matches":["<all_urls>"]}],"background":{"service_worker":"background.js"},"permissions":["storage"],"host_permissions":["http://localhost/*"],"content_security_policy":{"extension_pages":"script-src 'self' 'wasm-unsafe-eval' http://localhost:*; object-src 'self';"}}),
      scriptViteConfig: { plugins: [eslint({ fix: true }), babel()] },
    }),
  ],
})