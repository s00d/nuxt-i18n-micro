import { defineCommand } from 'citty'
import { run } from '../utils/git-baseline'

export const ensureNpmAuthCommand = defineCommand({
  meta: {
    name: 'ensure-npm-auth',
    description: [
      'Fail fast when the npm registry has no usable session.',
      '',
      'Release runs `pnpm publish -r` late, after a full build; discovering there that',
      'nobody is logged in wastes the whole run.',
      '',
      'Example:',
      '  pnpm -C scripts cli ensure-npm-auth',
    ].join('\n'),
  },
  setup() {
    let username: string
    try {
      username = run('pnpm', ['whoami'])
    } catch (error) {
      const err = error as { stderr?: Buffer; stdout?: Buffer; message?: string }
      const details = err.stderr?.toString().trim() || err.stdout?.toString().trim() || err.message || 'unknown error'

      console.error('Release aborted: npm registry authentication required.')
      console.error('Run `pnpm login` (or `npm login`) and retry.')
      console.error(details)
      process.exit(1)
    }

    if (!username) {
      console.error('Release aborted: `pnpm whoami` returned an empty user.')
      process.exit(1)
    }

    console.log(`npm registry auth ok (${username})`)
  },
})
