import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import { endent } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { createRequire } from 'module'
import outputFiles from 'output-files'
import P from 'path'
import { fileURLToPath } from 'url'

import dev from './dev.js'
import lint from './lint.js'
import prepublishOnly from './prepublish-only.js'

const __dirname = P.dirname(fileURLToPath(import.meta.url))

const isInNodeModules = __dirname.split(P.sep).includes('node_modules')

const resolver = createRequire(import.meta.url)

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
    GOOGLE_CLIENT_ID: '${{ secrets.GOOGLE_CLIENT_ID }}',
    GOOGLE_CLIENT_SECRET: '${{ secrets.GOOGLE_CLIENT_SECRET }}',
    GOOGLE_REFRESH_TOKEN: '${{ secrets.GOOGLE_REFRESH_TOKEN }}',
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
  prepare: () => {
    const configPath = isInNodeModules
      ? '@dword-design/base-config-web-extension/config'
      : `./${P.relative(process.cwd(), resolver.resolve('./config.js'))
          .split(P.sep)
          .join('/')}`
    outputFiles({
      '.eslintrc.json': `${JSON.stringify({ extends: packageName`@dword-design/eslint-config` }, undefined, 2)}\n`,
      'vite.config.js': endent`
        import config from '${configPath}'

        export default config
      `,
    })
  },
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
