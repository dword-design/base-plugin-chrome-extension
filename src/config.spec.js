import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require'

export default {
  string: () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: 'chrome-extension',
        })
      )
      expect(stealthyRequire(require.cache, () => require('./config'))).toEqual(
        {}
      )
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: {
            name: 'chrome-extension',
            startUrl: 'https://google.com',
          },
        })
      )
      expect(
        stealthyRequire(require.cache, () => require('./config'))
      ).toEqual({ name: 'chrome-extension', startUrl: 'https://google.com' })
    }),
}
