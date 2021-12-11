import { outputFile } from 'fs-extra'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from './get-config'

export default {
  string: () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: 'web-extension',
        })
      )
      expect(await self()).toEqual({})
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
      expect(await self()).toEqual({
        name: 'web-extension',
        startUrl: 'https://google.com',
      })
    }),
}
