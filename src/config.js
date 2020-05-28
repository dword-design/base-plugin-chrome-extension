import loadPkg from 'load-pkg'

const baseConfig = loadPkg.sync()?.baseConfig

export default typeof baseConfig === 'string' ? {} : baseConfig
