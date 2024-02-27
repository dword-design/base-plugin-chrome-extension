import { build } from 'vite'

import getViteConfig from './get-vite-config.js'

export default () => () => build(getViteConfig())
