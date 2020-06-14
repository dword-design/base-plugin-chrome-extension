import outputFiles from 'output-files'
import getPackageName from 'get-package-name'
import execa from 'execa'
import baseConfig from './base-config'
import dev from './dev'
import prepublishOnly from './prepublish-only'
import lint from './lint'
import developerMd from './developer-md.config'

export default {
  allowedMatches: [
    'artifacts',
    'assets',
    'background.js',
    'content.js',
    'config.json',
    'DEVELOPER.md',
    'icon.png',
    'options.html',
    'popup.html',
    'options.js',
    'popup.js',
    'model',
  ],
  gitignore: ['/.eslintrc.json', '/artifacts', '/dist', 'source.zip'],
  lint,
  prepare: () =>
    outputFiles({
      '.eslintrc.json': JSON.stringify(
        {
          extends: getPackageName(
            require.resolve('@dword-design/eslint-config')
          ),
          globals: {
            browser: 'readonly',
          },
        },
        undefined,
        2
      ),
      'DEVELOPER.md': developerMd,
    }),
  commands: {
    dev: {
      arguments: '[target]',
      handler: dev,
    },
    prepublishOnly,
    source: () => execa.command('git archive --output=source.zip HEAD'),
  },
  deployPlugins: [
    [
      getPackageName(require.resolve('@semantic-release/exec')),
      {
        prepareCmd: 'yarn prepublishOnly',
      },
    ],
    [
      getPackageName(require.resolve('semantic-release-chrome')),
      {
        asset: 'extension.zip',
        extensionId: baseConfig.chromeExtensionId,
        target: 'draft',
      },
    ],
  ],
  deployEnv: {
    GOOGLE_CLIENT_ID: '${{ secrets.GOOGLE_CLIENT_ID }}',
    GOOGLE_CLIENT_SECRET: '${{ secrets.GOOGLE_CLIENT_SECRET }}',
    GOOGLE_REFRESH_TOKEN: '${{ secrets.GOOGLE_REFRESH_TOKEN }}',
  },
  deployAssets: [
    {
      path: 'extension.zip',
      label: 'Extension',
    },
  ],
}
