const { spawn } = require('child-process-promise')

module.exports = {
  build: ({ lang }) => spawn(
    'webpack',
    ['--config', require.resolve('./webpack.config')],
    { stdio: 'inherit', env: { ...process.env, BABEL_CONFIG: JSON.stringify(lang.babelConfig) } },
  ),
  start: ({ lang }) => spawn(
    'webpack',
    ['--watch', '--config', require.resolve('./webpack.config')],
    { stdio: 'inherit', env: { ...process.env, BABEL_CONFIG: JSON.stringify(lang.babelConfig) } },
  ),
}
