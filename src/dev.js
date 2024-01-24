import webpack from 'webpack'

import getWebpackConfig from './get-webpack-config.js'

export default config =>
  (target = 'firefox-desktop') => {
    process.env.WEB_EXT_TARGET = target

    return new Promise(() =>
      webpack(getWebpackConfig(config)).watch({}, () => {}),
    )
  }
