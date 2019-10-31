#!/usr/bin/env node

const { base } = require('@dword-design/base-core')
const { spawn } = require('child-process-promise')

base({
  prepare: () => spawn('webpack', ['--config', require.resolve('./webpack.config')], { stdio: 'inherit' }),
  start: () => spawn('webpack', ['--watch', '--config', require.resolve('./webpack.config')], { stdio: 'inherit' }),
})
