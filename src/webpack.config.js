import CopyWebpackPlugin from 'copy-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ZipWebpackPlugin from 'zip-webpack-plugin'
import nodeEnv from 'better-node-env'
import getPackageName from 'get-package-name'
import { existsSync } from 'fs-extra'

export default {
  mode: nodeEnv === 'production' ? nodeEnv : 'development',
  devtool: false,
  entry: {
    ...(existsSync('background.js') && { background: './background.js' }),
    ...(existsSync('content.js') && { content: './content.js' }),
    ...(existsSync('options.js') && { options: './options.js' }),
    ...(existsSync('popup.js') && { popup: './popup.js' }),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets', noErrorOnMissing: true },
        'manifest.json',
        { from: 'options.html', noErrorOnMissing: true },
        { from: 'popup.html', noErrorOnMissing: true },
      ],
    }),
    ...(nodeEnv === 'production'
      ? [
          new ZipWebpackPlugin({
            path: '..',
            filename: 'dist.zip',
          }),
        ]
      : []),
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        use: {
          loader: getPackageName(require.resolve('eslint-loader')),
          options: {
            failOnWarning: true,
            fix: true,
          },
        },
      },
      {
        test: /\.js$/,
        use: {
          loader: getPackageName(require.resolve('babel-loader')),
        },
      },
    ],
  },
}
