import webpack from 'webpack'

import getWebpackConfig from './get-webpack-config.js'

export default config => (target = 'chromium') => {
  process.env.WEB_EXT_TARGET = target
  return new Promise(() => webpack(getWebpackConfig(config)).watch({}, () => {}))
}
