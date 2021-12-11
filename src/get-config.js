import loadPkg from 'load-pkg'

export default async () => {
  const baseConfig = (await loadPkg())?.baseConfig

  return typeof baseConfig === 'string' ? {} : baseConfig
}
