import { defineCommand } from 'citty'
import pkg from '../package.json' with { type: 'json' }
import { commands } from './commands'

export const main = defineCommand({
  meta: {
    name: pkg.name,
    version: pkg.version,
    description: [
      'Release and verification tooling for nuxt-i18n-micro.',
      '',
      'From the repository root:',
      '  pnpm -C scripts cli <command> [flags]',
      '',
      'From this directory:',
      '  pnpm cli <command> [flags]',
      '',
      'Run `pnpm -C scripts cli --help` for the command list, or',
      '`pnpm -C scripts cli <command> --help` for a single one.',
    ].join('\n'),
  },
  subCommands: commands,
})
