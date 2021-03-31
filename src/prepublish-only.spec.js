import { endent, mapValues, noop } from '@dword-design/functions'
import execa from 'execa'
import globby from 'globby'
import outputFiles from 'output-files'
import P from 'path'
import withLocalTmpDir from 'with-local-tmp-dir'

const runTest = config => () => {
  config = { test: noop, ...config }

  return withLocalTmpDir(async () => {
    await outputFiles(config.files)
    await execa.command('base prepare')
    await execa.command('base prepublishOnly')

    return config.test()
  })
}

export default {
  valid: {
    files: {
      'assets/foo.png': '',
      'background.js': '',
      'config.json': JSON.stringify({ name: 'Foo' }, undefined, 2),
      'content.js': endent`
        import foo from './model/foo'

        export default foo

      `,
      'model/foo.js': 'export default 1',
      'node_modules/base-config-self/index.js':
        "module.exports = require('../../../src')",
      'options.html': '',
      'options.js': '',
      'package.json': JSON.stringify(
        {
          baseConfig: 'self',
          description: 'foo bar',
          version: '2.0.0',
        },
        undefined,
        2
      ),
      'popup.html': '',
      'popup.js': '',
    },
    test: async () => {
      expect(await globby('*', { onlyFiles: false })).toEqual(
        expect.arrayContaining([
          'artifacts',
          'assets',
          'background.js',
          'content.js',
          'dist',
          'config.json',
          'model',
          'options.html',
          'options.js',
          'popup.html',
          'popup.js',
        ])
      )
      expect(await globby('*', { cwd: 'dist', onlyFiles: false })).toEqual([
        'assets',
        'background.js',
        'browser-polyfill.js',
        'content.js',
        'manifest.json',
        'options.html',
        'options.js',
        'popup.html',
        'popup.js',
      ])
      expect(require(P.join(process.cwd(), 'dist', 'manifest.json'))).toEqual({
        background: {
          persistent: false,
          scripts: ['browser-polyfill.js', 'background.js'],
        },
        browser_action: {
          default_popup: 'popup.html',
        },
        content_scripts: [
          {
            js: ['browser-polyfill.js', 'content.js'],
            matches: ['<all_urls>'],
          },
        ],
        description: 'foo bar',
        manifest_version: 2,
        name: 'Foo',
        version: '2.0.0',
      })
    },
  },
} |> mapValues(runTest)
