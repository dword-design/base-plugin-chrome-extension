import { pick } from '@dword-design/functions'
import fs from 'fs-extra'
import loadPkg from 'load-pkg'

export default async () => {
  const packageConfig = await loadPkg()

  const config = await fs.readJson('config.json').catch(() => ({}))

  const iconExists = await fs.exists('assets/icon.png')

  const popupExists = await fs.exists('popup.html')

  return {
    name: config.name,
    ...(packageConfig |> pick(['version', 'description'])),
    manifest_version: 2,
    ...(iconExists && {
      icons: {
        128: 'assets/icon.png',
      },
    }),
    ...(('browser_action' in config || popupExists) && {
      browser_action: {
        ...(iconExists && { default_icon: 'assets/icon.png' }),
        ...(popupExists && { default_popup: 'popup.html' }),
        ...(typeof config.browser_action === 'object' && config.browser_action),
      },
    }),
    ...((await fs.exists('content.js')) && {
      content_scripts: [
        {
          js: ['content.js'],
          matches: config.matches || ['<all_urls>'],
        },
      ],
    }),
    ...((await fs.exists('background.js')) && {
      background: {
        persistent: false,
        scripts: ['background.js'],
      },
    }),
    ...(config |> pick(['permissions', 'browser_specific_settings'])),
  }
}
