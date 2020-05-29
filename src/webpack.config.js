import CopyWebpackPlugin from 'copy-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import { WebExtWebpackPlugin } from 'webext-webpack-plugin'
import WebpackBar from 'webpackbar'
import nodeEnv from 'better-node-env'
import getPackageName from 'get-package-name'
import { existsSync } from 'fs-extra'
import config from './config'

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
    new WebpackBar(),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: require.resolve('webextension-polyfill') },
        { from: 'assets', to: 'assets', noErrorOnMissing: true },
        'manifest.json',
        { from: 'options.html', noErrorOnMissing: true },
        { from: 'popup.html', noErrorOnMissing: true },
      ],
    }),
    new WebExtWebpackPlugin({
      build: {
        artifactsDir: 'artifacts',
      },
      run: {
        startUrl: config.startUrl,
        target: process.env.WEB_EXT_TARGET,
      },
    }),
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules)/,
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
      {
        test: /\.s[ac]ss$/i,
        use: [
          getPackageName(require.resolve('raw-loader')),
          getPackageName(require.resolve('sass-loader')),
        ],
      },
    ],
  },
}
