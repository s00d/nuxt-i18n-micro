import * as path from 'node:path'

export function safeResolvePath(projectRoot: string, filePath: string): string {
  const normalizedFile = filePath.replace(/^\/+/, '').replace(/\/+/g, '/')
  const resolvedPath = path.resolve(projectRoot, normalizedFile)
  const normalizedRoot = path.resolve(projectRoot)
  const normalizedFilePath = path.resolve(resolvedPath)

  if (!normalizedFilePath.startsWith(normalizedRoot)) {
    throw new Error(`Access denied: Path ${resolvedPath} is outside project root`)
  }

  return resolvedPath
}
