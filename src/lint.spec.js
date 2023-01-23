import { endent } from '@dword-design/functions'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import P from 'path'
import { Base } from '@dword-design/base'

import self from './lint.js'

export default {
  errors: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'config.json': JSON.stringify({ name: 'foo' }),
        'content.js': endent`
          const foo = 'bar'

        `,
      })
      await new Base({ name: P.resolve('..', 'src', 'index.js') }).prepare()
      await expect(self()).rejects.toThrow(
        "'foo' is assigned a value but never used"
      )
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'config.json': JSON.stringify({ name: 'foo' }),
        'content.js': endent`
          import './model/foo'

        `,
        'model/foo.js': '',
      })
      await new Base({ name: P.resolve('..', 'src', 'index.js') }).prepare()
      await self()
    }),
}
