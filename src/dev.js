import execa from 'execa'

export default (target = 'firefox-desktop') =>
  execa(
    'webpack-cli',
    ['--watch', '--config', require.resolve('./webpack.config')],
    { stdio: 'inherit', env: { ...process.env, WEB_EXT_TARGET: target } }
  )
