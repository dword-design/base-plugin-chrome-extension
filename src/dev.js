import execa from 'execa'

export default () =>
  execa(
    'webpack-cli',
    ['--watch', '--config', require.resolve('./webpack.config')],
    { stdio: 'inherit' }
  )
