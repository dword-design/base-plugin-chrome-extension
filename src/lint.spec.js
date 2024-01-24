import { Base } from '@dword-design/base'
import { endent } from '@dword-design/functions'
import outputFiles from 'output-files'
import P from 'path'
import withLocalTmpDir from 'with-local-tmp-dir'

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
        "'foo' is assigned a value but never used",
      )
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'config.json': JSON.stringify({ name: 'foo' }),
        'content.js': endent`
          import './model/foo.js'

        `,
        'model/foo.js': '',
      })
      await new Base({ name: P.resolve('..', 'src', 'index.js') }).prepare()
      await self()
    }),
}
