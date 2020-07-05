import { endent } from '@dword-design/functions'
import execa from 'execa'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

import lint from './lint'

export default {
  errors: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'config.json': JSON.stringify(
          {
            name: 'foo',
          },
          undefined,
          2
        ),
        'content.js': endent`
          const foo = 'bar'

        `,
        'node_modules/base-config-self/index.js':
          "module.exports = require('../../../src')",
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
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
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'config.json': JSON.stringify(
          {
            name: 'foo',
          },
          undefined,
          2
        ),
        'content.js': endent`
          import './model/foo'

        `,
        'model/foo.js': '',
        'node_modules/base-config-self/index.js':
          "module.exports = require('../../../src')",
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
          },
          undefined,
          2
        ),
      })
      await execa.command('base prepare')
      await lint()
    }),
}
