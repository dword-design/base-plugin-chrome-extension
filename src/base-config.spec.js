import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require'

export default {
  string: () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: 'web-extension',
        })
      )
      expect(
        stealthyRequire(require.cache, () => require('./base-config'))
      ).toEqual({})
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: {
            name: 'web-extension',
            startUrl: 'https://google.com',
          },
        })
      )
      expect(
        stealthyRequire(require.cache, () => require('./base-config'))
      ).toEqual({ name: 'web-extension', startUrl: 'https://google.com' })
    }),
}
