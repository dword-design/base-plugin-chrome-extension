import { execaCommand } from 'execa'

export default () => browser => execaCommand('vite', { env: { TARGET: browser }, stdio: 'inherit' })
