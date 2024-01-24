import { pick } from '@dword-design/functions'
import fs from 'fs-extra'
import loadPkg from 'load-pkg'

export default async configString => {
  const packageConfig = await loadPkg()

  const config = JSON.parse(configString)

  const iconExists = fs.existsSync('assets/icon.png')

  const popupExists = fs.existsSync('popup.html')

  return JSON.stringify({
    name: config.name,
    ...(packageConfig |> pick(['version', 'description'])),
    manifest_version: 3,
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
    ...(fs.existsSync('content.js') && {
      content_scripts: [
        {
          js: ['content.js'],
          matches: config.matches || ['<all_urls>'],
        },
      ],
    }),
    ...(fs.existsSync('service-worker.js') && {
      background: {
        service_worker: 'service-worker.js',
      },
    }),
    ...(config |> pick(['permissions', 'host_permissions', 'browser_specific_settings'])),
  })
}
