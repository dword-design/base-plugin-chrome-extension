import { endent, mapValues, noop } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import execa from 'execa'
import glob from 'glob-promise'
import P from 'path'

const runTest = ({ files, test = noop }) => () =>
  withLocalTmpDir(async () => {
    await outputFiles(files)
    await execa.command('base prepare')
    await execa.command('base prepublishOnly')
    return test()
  })

export default {
  valid: {
    files: {
      'assets/foo.png': '',
      'background.js': '',
      'content.js': endent`
        import foo from './model/foo'
  
        export default foo
  
      `,
      'config.json': JSON.stringify({ name: 'Foo' }, undefined, 2),
      'model/foo.js': 'export default 1',
      'options.html': '',
      'options.js': '',
      'package.json': JSON.stringify(
        {
          version: '2.0.0',
          description: 'foo bar',
          baseConfig: require.resolve('.'),
        },
        undefined,
        2
      ),
      'popup.html': '',
      'popup.js': '',
    },
    test: async () => {
      expect(await glob('*')).toEqual(
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
      expect(await glob('*', { cwd: 'dist' })).toEqual([
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
        name: 'Foo',
        description: 'foo bar',
        version: '2.0.0',
        manifest_version: 2,
        content_scripts: [
          {
            js: ['browser-polyfill.js', 'content.js'],
            matches: ['<all_urls>'],
          },
        ],
        background: {
          scripts: ['browser-polyfill.js', 'background.js'],
          persistent: false,
        },
      })
    },
  },
} |> mapValues(runTest)
