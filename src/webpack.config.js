import nodeEnv from 'better-node-env'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { existsSync } from 'fs-extra'
import getPackageName from 'get-package-name'
import { WebExtWebpackPlugin } from 'webext-webpack-plugin'
import WebpackBar from 'webpackbar'

import baseConfig from './base-config'
import configToManifest from './config-to-manifest'

export default {
  devtool: false,
  entry: {
    ...(existsSync('background.js') && { background: './background.js' }),
    ...(existsSync('content.js') && { content: './content.js' }),
    ...(existsSync('options.js') && { options: './options.js' }),
    ...(existsSync('popup.js') && { popup: './popup.js' }),
  },
  mode: nodeEnv === 'production' ? nodeEnv : 'development',
  module: {
    rules: [
      {
        enforce: 'pre',
        exclude: /(node_modules)/,
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
      {
        test: /\.s[ac]ss$/i,
        use: [
          getPackageName(require.resolve('raw-loader')),
          getPackageName(require.resolve('sass-loader')),
        ],
      },
    ],
  },
  plugins: [
    new WebpackBar(),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'config.json',
          to: 'manifest.json',
          transform: configToManifest,
        },
        { from: require.resolve('webextension-polyfill') },
        { from: 'assets', noErrorOnMissing: true, to: 'assets' },
        { from: 'options.html', noErrorOnMissing: true },
        { from: 'popup.html', noErrorOnMissing: true },
      ],
    }),
    new WebExtWebpackPlugin({
      build: {
        artifactsDir: 'artifacts',
      },
      run: {
        startUrl: baseConfig.startUrl,
        target: process.env.WEB_EXT_TARGET,
      },
    }),
  ],
}
