import webpack from 'webpack'

import getWebpackConfig from './get-webpack-config.js'

export default config => () =>
  new Promise((resolve, reject) =>
    webpack(getWebpackConfig(config), error => {
      if (error) {
        return reject(error)
      }

      return resolve()
    }),
  )
