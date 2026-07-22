import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Resolve the deepest existing ancestor of `p` through `fs.realpathSync` (so
 * symlinks are followed), then re-append the not-yet-existing tail. Lets us
 * validate both existing reads and to-be-created write targets.
 */
function realpathAllowingMissing(p: string): string {
  let current = p
  const tail: string[] = []
  while (!fs.existsSync(current)) {
    tail.unshift(path.basename(current))
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  const realExisting = fs.realpathSync(current)
  return tail.length > 0 ? path.join(realExisting, ...tail) : realExisting
}

export function safeResolvePath(projectRoot: string, filePath: string): string {
  const normalizedFile = filePath.replace(/^\/+/, '').replace(/\/+/g, '/')
  const resolvedPath = path.resolve(projectRoot, normalizedFile)

  // Compare real (symlink-resolved) paths so a symlink inside the tree cannot
  // point outside it, and use path.relative for a true boundary check —
  // `startsWith` would wrongly accept a sibling like `<root>-evil`.
  const realRoot = fs.realpathSync(path.resolve(projectRoot))
  const realCandidate = realpathAllowingMissing(resolvedPath)
  const rel = path.relative(realRoot, realCandidate)

  if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
    throw new Error(`Access denied: Path ${resolvedPath} is outside project root`)
  }

  return resolvedPath
}
