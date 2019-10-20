const { spawn } = require('child-process-promise')

const mapEslintConfig = config => ({
  ...config,
  env: {
    ...config.env,
    webextensions: true,
  },
})

module.exports = {
  build: ({ lang }) => spawn(
    'webpack',
    ['--config', require.resolve('./webpack.config')],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        BABEL_CONFIG: JSON.stringify(lang.babelConfig),
        ESLINT_CONFIG: JSON.stringify(mapEslintConfig(lang.eslintConfig)),
      },
    },
  ),
  start: ({ lang }) => spawn(
    'webpack',
    ['--watch', '--config', require.resolve('./webpack.config')],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        BABEL_CONFIG: JSON.stringify(lang.babelConfig),
        ESLINT_CONFIG: JSON.stringify(mapEslintConfig(lang.eslintConfig)),
      },
    },
  ),
  mapEslintConfig,
}
