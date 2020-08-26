import { pick } from '@dword-design/functions'
import { existsSync } from 'fs-extra'
import loadPkg from 'load-pkg'

export default async configString => {
  const packageConfig = await loadPkg()
  const config = JSON.parse(configString)
  const iconExists = existsSync('assets/icon.png')
  return JSON.stringify({
    name: config.name,
    ...(packageConfig |> pick(['version', 'description'])),
    manifest_version: 2,
    ...(iconExists && {
      icons: {
        128: 'assets/icon.png',
      },
    }),
    ...('browser_action' in config && {
      browser_action: {
        ...(iconExists && { default_icon: 'assets/icon.png' }),
        ...(typeof config.browser_action === 'object' && config.browser_action),
      },
    }),
    ...(existsSync('content.js') && {
      content_scripts: [
        {
          js: ['browser-polyfill.js', 'content.js'],
          matches: config.matches || ['<all_urls>'],
        },
      ],
    }),
    ...(existsSync('background.js') && {
      background: {
        persistent: false,
        scripts: ['browser-polyfill.js', 'background.js'],
      },
    }),
    ...(config |> pick(['permissions', 'browser_specific_settings'])),
  })
}
