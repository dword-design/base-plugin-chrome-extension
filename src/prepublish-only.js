import { execaCommand } from 'execa'

export default () => browser => execaCommand('vite build', { env: { TARGET: browser }, stdio: 'inherit' })
