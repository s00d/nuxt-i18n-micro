/**
 * One page per workspace package, from the same API snapshots the reference index reads.
 *
 * A dynamic route rather than fifteen committed Markdown files: adding a package to the
 * workspace adds its page, and removing one removes it, with nothing to regenerate.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type ApiPackage, parseSnapshot } from '../packages.data'

/** The route param has to be named after the `[pkg]` in the filename, or every page collides. */
type PackageParams = ApiPackage & { pkg: string }

const SNAPSHOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../scripts/api-surface')

export default {
  paths(): { params: PackageParams }[] {
    return readdirSync(SNAPSHOT_DIR)
      .filter((file) => file.endsWith('.api.txt'))
      .map((file) => {
        const name = `@${file.replace(/\.api\.txt$/, '').replace('__', '/')}`
        const parsed = parseSnapshot(name, readFileSync(join(SNAPSHOT_DIR, file), 'utf8'))
        return { params: { ...parsed, pkg: parsed.slug } }
      })
      .sort((a, b) => a.params.name.localeCompare(b.params.name))
  },
}
