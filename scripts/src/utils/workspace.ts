import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repository root, from `scripts/src/utils` up three levels. */
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
export const scriptsDir = resolve(repoRoot, 'scripts')
