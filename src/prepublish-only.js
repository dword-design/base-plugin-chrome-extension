import execa from 'execa'

export default () =>
  execa('webpack-cli', ['--config', require.resolve('./webpack.config')], {
    stdio: 'inherit',
  })
