import { execaCommand } from 'execa'

import getManifest from './get-manifest.js'

export default () =>
  async (browser = 'chrome') =>
    execaCommand('vite', {
      env: {
        MANIFEST: JSON.stringify(await getManifest({ browser })),
        TARGET: browser,
      },
      stdio: 'inherit',
    })
