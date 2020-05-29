import { outputFile } from 'fs-extra'
import getPackageName from 'get-package-name'
import loadPkg from 'load-pkg'
import baseConfig from './base-config'
import dev from './dev'
import prepublishOnly from './prepublish-only'
import lint from './lint'

const packageConfig = loadPkg.sync() || {}

export default {
  allowedMatches: [
    'artifacts',
    'assets',
    'background.js',
    'content.js',
    'config.json',
    'options.html',
    'popup.html',
    'options.js',
    'popup.js',
    'model',
  ],
  gitignore: ['/.eslintrc.json'],
  test: lint,
  prepare: () =>
    outputFile(
      '.eslintrc.json',
      JSON.stringify(
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
      )
    ),
  commands: {
    dev: {
      arguments: '[target]',
      handler: dev,
    },
    prepublishOnly,
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
        ...(packageConfig.isPrivate && { target: 'trustedTesters' }),
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
