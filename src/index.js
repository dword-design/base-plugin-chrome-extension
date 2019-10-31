#!/usr/bin/env node

import { base } from '@dword-design/base'
import { spawn } from 'child_process'

base({
  prepare: () => spawn('webpack', ['--config', require.resolve('./webpack.config')], { stdio: 'inherit' }),
  start: () => spawn('webpack', ['--watch', '--config', require.resolve('./webpack.config')], { stdio: 'inherit' }),
})
