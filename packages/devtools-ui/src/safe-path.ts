import * as fs from 'node:fs'
import * as path from 'node:path'

function rejectInvalidSymlink(linkPath: string, originalPath: string): void {
  const linkTarget = fs.readlinkSync(linkPath)
  const absoluteTarget = path.isAbsolute(linkTarget) ? linkTarget : path.resolve(path.dirname(linkPath), linkTarget)
  if (!fs.existsSync(absoluteTarget)) {
    throw new Error(`Access denied: Path ${originalPath} resolves through an invalid symlink`)
  }
}

/**
 * Resolve the deepest existing ancestor of `p` through `fs.realpathSync` (so
 * symlinks are followed), then re-append the not-yet-existing tail. Lets us
 * validate both existing reads and to-be-created write targets.
 */
function realpathAllowingMissing(p: string): string {
  let current = p
  const tail: string[] = []

  while (true) {
    try {
      const stat = fs.lstatSync(current)
      if (stat.isSymbolicLink()) {
        rejectInvalidSymlink(current, p)
      }
      break
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Access denied:')) {
        throw error
      }
      // Missing segment — walk up and keep the tail.
      tail.unshift(path.basename(current))
      const parent = path.dirname(current)
      if (parent === current) break
      current = parent
    }
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
