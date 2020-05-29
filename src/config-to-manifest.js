import loadPkg from 'load-pkg'
import { existsSync } from 'fs-extra'
import { pick, omit } from '@dword-design/functions'

export default async configString => {
  const packageConfig = await loadPkg()
  const config = JSON.parse(configString)

  return JSON.stringify({
    ...(packageConfig |> pick(['version', 'description'])),
    manifest_version: 2,
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
        scripts: ['browser-polyfill.js', 'background.js'],
        persistent: false,
      },
    }),
    ...(config |> omit('matches')),
  })
}
