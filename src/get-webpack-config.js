import nodeEnv from 'better-node-env'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import packageName from 'depcheck-package-name'
import EslintWebpackPlugin from 'eslint-webpack-plugin'
import fs from 'fs-extra'
import { WebExtWebpackPlugin } from 'webext-webpack-plugin'
import WebpackBar from 'webpackbar'

import configToManifest from './config-to-manifest.js'

export default config => ({
  devtool: false,
  entry: {
    ...(fs.existsSync('background.js') && { background: './background.js' }),
    ...(fs.existsSync('content.js') && { content: './content.js' }),
    ...(fs.existsSync('options.js') && { options: './options.js' }),
    ...(fs.existsSync('popup.js') && { popup: './popup.js' }),
  },
  mode: nodeEnv === 'production' ? nodeEnv : 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: packageName`babel-loader`,
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [packageName`raw-loader`, packageName`sass-loader`],
      },
    ],
  },
  output: {
    clean: true,
  },
  plugins: [
    new EslintWebpackPlugin({ failOnWarning: true, fix: true }),
    new WebpackBar(),
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
        startUrl: config.startUrl,
        target: process.env.WEB_EXT_TARGET,
      },
    }),
  ],
})
