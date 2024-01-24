import webpack from 'webpack'

import getWebpackConfig from './get-webpack-config.js'

export default config => () =>
  new Promise((resolve, reject) =>
    webpack(getWebpackConfig(config), (error, stats) => {
      if (error) {
        return reject(error)
      }
      if (stats.hasErrors()) {
        return reject(
          new Error(JSON.stringify(stats.toJson().errors, undefined, 2)),
        )
      }

      return resolve()
    }),
  )
