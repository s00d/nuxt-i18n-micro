/** Directory walking shared by the audit commands. */
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/** Directories that are build output or installed packages, never sources. */
export const IGNORED_DIRS = new Set([
  'node_modules',
  '.nuxt',
  '.output',
  '.output-shared',
  '.nuxt-test',
  'dist',
  '.git',
  'coverage',
  'test-results',
  '.vitepress',
])

export interface WalkOptions {
  /** Only return files whose name ends with one of these. */
  extensions?: string[]
  /** Extra directory names to skip. */
  skipDirs?: Set<string>
}

/** Every file under `root`, as paths relative to it. */
export function walkFiles(root: string, options: WalkOptions = {}): string[] {
  const found: string[] = []
  const skip = options.skipDirs ?? IGNORED_DIRS

  const visit = (dir: string): void => {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) visit(full)
        continue
      }
      if (options.extensions && !options.extensions.some((ext) => entry.name.endsWith(ext))) continue
      found.push(relative(root, full))
    }
  }

  visit(root)
  return found.sort()
}

/** Total size in bytes of every file under `root`. */
export function dirSize(root: string): number {
  let total = 0
  for (const file of walkFiles(root, { skipDirs: new Set() })) {
    try {
      total += statSync(join(root, file)).size
    } catch {
      // A file that vanished between listing and stat contributes nothing.
    }
  }
  return total
}
