import CopyWebpackPlugin from 'copy-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ZipWebpackPlugin from 'zip-webpack-plugin'
import nodeEnv from 'better-node-env'
import { babelConfigFilename, eslintConfigFilename } from '@dword-design/base'
import { mergeAll } from '@functions'

export default {
  mode: nodeEnv,
  devtool: false,
  entry: {
    background: './src/background.js',
    content: './src/content.js',
    options: './src/options.js',
    popup: './src/popup.js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin(['static'], { copyUnmodified: true }),
    ...nodeEnv === 'production'
      ? [
        new ZipWebpackPlugin({
          path: '..',
          filename: 'dist.zip',
        }),
      ]
      : [],
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        use: {
          loader: 'eslint-loader',
          options: {
            baseConfig: mergeAll([
              require(eslintConfigFilename),
              {
                env: {
                  webextensions: true,
                },
              },
            ]),
          },
        },
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: babelConfigFilename,
          },
        },
      },
    ],
  },
}
