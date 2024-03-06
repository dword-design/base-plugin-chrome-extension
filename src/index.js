import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import { endent } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import outputFiles from 'output-files'

import dev from './dev.js'
import lint from './lint.js'
import prepublishOnly from './prepublish-only.js'

export default config => ({
  allowedMatches: [
    'assets',
    'background.js',
    'content.js',
    'config.json',
    'icon.png',
    'index.spec.js',
    'options.html',
    'popup.html',
    'options.js',
    'popup.js',
    'model',
  ],
  commands: {
    dev: {
      arguments: '[browser]',
      handler: dev(config),
    },
    prepublishOnly: {
      arguments: '[browser]',
      handler: prepublishOnly(config),
    },
  },
  depcheckConfig: {
    parsers: {
      '**/*.scss': depcheckParserSass,
    },
  },
  deployAssets: [
    {
      label: 'Extension',
      path: 'extension.zip',
    },
  ],
  deployEnv: {
    CHROME_CLIENT_ID: '${{ secrets.CHROME_CLIENT_ID }}',
    CHROME_CLIENT_SECRET: '${{ secrets.CHROME_CLIENT_SECRET }}',
    CHROME_EXTENSION_ID: '${{ secrets.CHROME_EXTENSION_ID }}',
    CHROME_REFRESH_TOKEN: '${{ secrets.CHROME_REFRESH_TOKEN }}',
    FIREFOX_EXTENSION_ID: '${{ secrets.FIREFOX_EXTENSION_ID }}',
    FIREFOX_JWT_ISSUER: '${{ secrets.FIREFOX_JWT_ISSUER }}',
    FIREFOX_JWT_SECRET: '${{ secrets.FIREFOX_JWT_SECRET }}',
  },
  deployPlugins: [
    [
      packageName`@semantic-release/exec`,
      {
        prepareCmd: `yarn prepublishOnly && yarn prepublishOnly firefox && zip -r dist/chrome dist/chrome.zip && zip -r dist/firefox dist/firefox.zip && git archive --output=dist/firefox-sources.zip HEAD && ${packageName`publish-browser-extension`} --chrome-zip=dist/chrome.zip --firefox-zip=dist/firefox.zip --firefox-sources=dist/firefox-sources.zip`,
      },
    ],
  ],
  editorIgnore: ['.eslintrc.json', 'dist', 'vite.config.js'],
  gitignore: ['/.eslintrc.json', '/dist', '/vite.config.js'],
  isLockFileFixCommitType: true,
  lint,
  prepare: () =>
    outputFiles({
      '.eslintrc.json': `${JSON.stringify({ extends: packageName`@dword-design/eslint-config` }, undefined, 2)}\n`,
      'vite.config.js': endent`
        import vue from '${packageName`@vitejs/plugin-vue`}'
        import P from 'path'
        import { defineConfig } from '${packageName`vite`}'
        import babel from '${packageName`vite-plugin-babel`}'
        import eslint from '${packageName`vite-plugin-eslint`}'
        import webExtension from '${packageName`vite-plugin-web-extension`}'

        export default defineConfig({
          build: {
            outDir: P.join('dist', process.env.TARGET),
          },
          plugins: [
            vue(),
            webExtension({
              browser: process.env.TARGET,
              manifest: () => JSON.parse(process.env.MANIFEST),
              scriptViteConfig: { plugins: [eslint({ fix: true }), babel()] },
            }),
          ],
        })\n
      `,
    }),
  readmeInstallString: endent`
    ## Recommended setup
    * Node.js 20.11.1
    * Yarn 1.22.19

    ## Install
    \`\`\`bash
    $ yarn --frozen-lockfile
    \`\`\`

    ## Running a development server
    \`\`\`bash
    $ yarn dev [browser]
    \`\`\`
    Available browsers are \`firefox\` and \`chrome\`. Default is \`firefox\`.

    ## Building the extension for upload
    \`\`\`bash
    $ yarn prepublishOnly [browser]
    \`\`\`
  `,
})
