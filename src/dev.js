import { createServer } from 'vite'

import getViteConfig from './get-vite-config.js'

export default () =>
  async (browser = 'firefox') => {
    const server = await createServer(getViteConfig({ browser }))
    await server.listen()
    server.printUrls()
    server.bindCLIShortcuts({ print: true })
  }
