import { endent, mapValues, noop } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import execa from 'execa'
import glob from 'glob-promise'

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
      'manifest.json': '{}',
      'model/foo.js': 'export default 1',
      'options.html': '',
      'options.js': '',
      'package.json': JSON.stringify(
        {
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
          'manifest.json',
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
    },
  },
  minimal: {
    files: {
      'background.js': '',
      'manifest.json': '{}',
      'package.json': JSON.stringify(
        {
          baseConfig: require.resolve('.'),
        },
        undefined,
        2
      ),
    },
  },
} |> mapValues(runTest)
