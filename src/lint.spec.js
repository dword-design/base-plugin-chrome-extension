import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import execa from 'execa'
import lint from './lint'

export default {
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'content.js': endent`
          import './model/foo'

        `,
        'manifest.json': JSON.stringify(
          {
            name: 'foo',
            version: '1.0',
            manifest_version: 2,
          },
          undefined,
          2
        ),
        'model/foo.js': '',
        'package.json': JSON.stringify(
          {
            baseConfig: require.resolve('.'),
          },
          undefined,
          2
        ),
      })

      await execa.command('base prepare')
      await lint()
    }),
  errors: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'content.js': endent`
          const foo = 'bar'
          
        `,
        'manifest.json': JSON.stringify(
          {
            name: 'foo',
            version: '1.0',
            manifest_version: 2,
          },
          undefined,
          2
        ),
        'package.json': JSON.stringify(
          {
            baseConfig: require.resolve('.'),
          },
          undefined,
          2
        ),
      })

      await execa.command('base prepare')
      await expect(lint()).rejects.toThrow(
        "'foo' is assigned a value but never used"
      )
    }),
  'missing manifest file': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            baseConfig: require.resolve('.'),
          },
          undefined,
          2
        ),
      })

      await execa.command('base prepare')
      await expect(lint()).rejects.toThrow('TYPE_NO_MANIFEST_JSON')
    }),
}
