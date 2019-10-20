const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ZipWebpackPlugin = require('zip-webpack-plugin')
const nodeEnv = require('better-node-env')

module.exports = {
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
          options: { baseConfig: JSON.parse(process.env.ESLINT_CONFIG) },
        }
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: JSON.parse(process.env.BABEL_CONFIG),
        }
      }
    ],
  },
}
