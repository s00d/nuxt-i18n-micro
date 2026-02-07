/**
 * Mock for globby ESM module
 * Jest doesn't handle ESM modules well, so we provide a CJS-compatible mock
 */
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

interface GlobbyOptions {
  cwd?: string
  absolute?: boolean
  ignore?: string[]
}

export async function globby(pattern: string | string[], options?: GlobbyOptions): Promise<string[]> {
  const patterns = Array.isArray(pattern) ? pattern : [pattern]
  const cwd = options?.cwd || process.cwd()
  const absolute = options?.absolute ?? false
  const ignore = options?.ignore || []

  const results: string[] = []

  function shouldIgnore(path: string): boolean {
    const normalizedPath = path.replace(/\\/g, '/')
    return ignore.some((ignorePattern) => {
      const normalizedIgnore = ignorePattern.replace(/\\/g, '/')
      // Convert glob pattern to regex
      const regexPattern = normalizedIgnore.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\./g, '\\.')
      const regex = new RegExp(`^${regexPattern}$`)
      return regex.test(normalizedPath)
    })
  }

  function matchesPattern(filePath: string, pattern: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/')
    // Convert glob pattern to regex
    const regexPattern = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\./g, '\\.')
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(normalizedPath)
  }

  function walkDir(dir: string, baseDir: string = cwd): void {
    try {
      const entries = readdirSync(dir)

      for (const entry of entries) {
        const fullPath = join(dir, entry)
        const relativePath = relative(baseDir, fullPath).replace(/\\/g, '/')

        if (shouldIgnore(relativePath)) {
          continue
        }

        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          walkDir(fullPath, baseDir)
        } else if (stat.isFile()) {
          // Check if file matches any pattern
          // For patterns like '**/*.json', we need to match against the relative path
          const matches = patterns.some((pattern) => {
            // Handle **/*.json pattern - should match any .json file in any subdirectory
            if (pattern.includes('**')) {
              const fileExtension = relativePath.split('.').pop()
              const patternExtension = pattern.split('.').pop()?.replace(/\*/g, '')
              if (patternExtension && fileExtension === patternExtension) {
                return true
              }
            }
            return matchesPattern(relativePath, pattern)
          })

          if (matches) {
            results.push(absolute ? fullPath : relativePath)
          }
        }
      }
    } catch {
      // Ignore errors (e.g., permission denied)
    }
  }

  walkDir(cwd)
  return results
}
