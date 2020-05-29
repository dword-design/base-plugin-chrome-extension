import { outputFile } from 'fs-extra'
import getPackageName from 'get-package-name'
import dev from './dev'
import prepublishOnly from './prepublish-only'
import lint from './lint'

export default {
  allowedMatches: [
    'artifacts',
    'assets',
    'background.js',
    'content.js',
    'manifest.json',
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
          env: {
            webextensions: true,
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
}
