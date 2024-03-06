import fs from 'fs-extra'
import loadPkg from 'load-pkg'
import { pick } from 'lodash-es'

export default async ({ browser }) => {
  const packageConfig = await loadPkg()

  const config = await fs.readJson('config.json').catch(() => ({}))

  const iconExists = await fs.exists('public/icon.png')

  const popupExists = await fs.exists('popup.html')

  return {
    name: config.name,
    ...pick(packageConfig, ['version', 'description']),
    manifest_version: 3,
    ...(iconExists && {
      icons: {
        128: 'icon.png',
      },
    }),
    ...(('action' in config || popupExists) && {
      action: {
        ...(iconExists && { default_icon: 'icon.png' }),
        ...(popupExists && { default_popup: 'popup.html' }),
        ...(typeof config.action === 'object' && config.action),
      },
    }),
    ...(((await fs.exists('content.js')) || config.css?.length > 0) && {
      content_scripts: [
        {
          js: ['content.js'],
          ...(config.css?.length > 0 && { css: config.css }),
          matches: config.matches || ['<all_urls>'],
        },
      ],
    }),
    ...((await fs.exists('background.js')) && {
      background: {
        ...(browser === 'firefox'
          ? {
              persistent: false,
              scripts: ['background.js'],
            }
          : { service_worker: 'background.js' }),
      },
    }),
    ...pick(config, [
      'host_permissions',
      'optional_host_permissions',
      'optional_permissions',
      'permissions',
      'browser_specific_settings',
      'css',
    ]),
  }
}
