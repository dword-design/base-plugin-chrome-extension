import { execa } from 'execa'

export default (target = 'firefox-desktop') =>
  execa(
    'webpack-cli',
    ['--watch', '--config', require.resolve('./webpack.config')],
    { env: { WEB_EXT_TARGET: target }, stdio: 'inherit' },
  )
