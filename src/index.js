import depcheckParserSass from '@dword-design/depcheck-parser-sass';
import { endent } from '@dword-design/functions';
import binName from 'depcheck-bin-name';
import packageName from 'depcheck-package-name';
import depcheckParserVue from 'depcheck-parser-vue';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import dev from './dev.js';
import lint from './lint.js';
import prepublishOnly from './prepublish-only.js';

export default config => ({
  allowedMatches: [
    'assets',
    'components',
    'public',
    'background.js',
    'content.js',
    'config.json',
    'index.spec.js',
    'options.html',
    'popup.html',
    'popup.js',
    'popup.vue',
    'options.js',
    'popup.js',
    'model',
  ],
  commands: {
    dev: { arguments: '[browser]', handler: dev(config) },
    prepublishOnly: { arguments: '[browser]', handler: prepublishOnly(config) },
  },
  depcheckConfig: {
    parsers: { '**/*.scss': depcheckParserSass, '**/*.vue': depcheckParserVue },
  },
  deployAssets: [{ label: 'Extension', path: 'extension.zip' }],
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
        publishCmd: `pnpm ${binName`publish-extension`} --chrome-zip=dist/chrome.zip --firefox-zip=dist/firefox.zip --firefox-sources-zip=dist/firefox-sources.zip`,
      },
    ],
  ],
  editorIgnore: ['.eslintrc.json', 'dist', 'userdata', 'vite.config.js'],
  gitignore: ['/.eslintrc.json', '/dist', '/userdata', '/vite.config.js'],
  isLockFileFixCommitType: true,
  lint,
  preDeploySteps: [
    { run: 'pnpm prepublishOnly' },
    {
      env: { FIREFOX_EXTENSION_ID: '${{ secrets.FIREFOX_EXTENSION_ID }}' },
      run: 'pnpm prepublishOnly firefox',
    },
    { run: 'zip -r ../chrome.zip .', 'working-directory': 'dist/chrome' },
    { run: 'zip -r ../firefox.zip .', 'working-directory': 'dist/firefox' },
    { run: 'git archive --output=dist/firefox-sources.zip HEAD' },
  ],
  prepare: () =>
    Promise.all([
      outputFiles({
        '.eslintrc.json': `${JSON.stringify({ extends: packageName`@dword-design/eslint-config` }, undefined, 2)}\n`,
        'vite.config.js': endent`
          import vue from '${packageName`@vitejs/plugin-vue`}'
          import P from 'path'
          import { defineConfig } from '${packageName`vite`}'
          import vueBabel from '${packageName`@dword-design/vite-plugin-vue-babel`}'
          import babel from '${packageName`vite-plugin-babel`}'
          import eslint from '${packageName`vite-plugin-eslint`}'
          import webExtension from '${packageName`vite-plugin-web-extension`}'
          import svgLoader from '${packageName`vite-svg-loader`}'

          export default defineConfig({
            build: {
              outDir: P.join('dist', process.env.TARGET),
            },
            plugins: [
              vueBabel(),
              vue(),
              svgLoader(),
              eslint({ fix: true }),
              webExtension({
                browser: process.env.TARGET,
                manifest: () => JSON.parse(process.env.MANIFEST),
                scriptViteConfig: { plugins: [babel(), eslint({ fix: true })] },
                webExtConfig: { keepProfileChanges: true, chromiumProfile: 'userdata' },
              }),
            ],
          })\n
        `,
      }),
      fs.ensureDir('userdata'),
    ]),
  readmeInstallString: endent`
    ## Recommended setup
    * Node.js 20.11.1
    * pnpm 9.15.3

    ## Install
    \`\`\`bash
    $ pnpm install --frozen-lockfile
    \`\`\`

    ## Running a development server
    \`\`\`bash
    $ pnpm dev [browser]
    \`\`\`
    Available browsers are \`firefox\` and \`chrome\`. Default is \`firefox\`.

    ## Building the extension for upload
    \`\`\`bash
    $ pnpm prepublishOnly [browser]
    \`\`\`
  `,
});
