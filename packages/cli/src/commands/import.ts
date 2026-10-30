import { readFileSync } from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { notFoundError } from '../errors'
import { walkFiles } from '../fs'
import { log } from '../log'
import { parsePo } from '../po'
import { GLOBAL_SCOPE, Project } from '../project'

export interface ImportArgs {
  cwd?: string
  translationDir?: string
  potsDir: string
}

function scopeOf(file: string, potsDir: string): string {
  const parts = relative(potsDir, dirname(file)).split(sep).filter(Boolean)
  return parts[0] === 'pages' ? parts.slice(1).join('/') : GLOBAL_SCOPE
}

export default async function run(args: ImportArgs): Promise<void> {
  const project = await Project.load(args)
  const potsDir = resolve(project.config.rootDir, args.potsDir)
  const files = walkFiles(potsDir, (path) => path.endsWith('.po'))
  if (files.length === 0) throw notFoundError(`No PO files in ${potsDir}`)

  let imported = 0
  for (const file of files) {
    const code = basename(file, '.po')
    if (!project.codes.includes(code)) {
      log.warn(`Skipping ${file}: ${code} is not a configured locale.`)
      continue
    }
    const scope = scopeOf(file, potsDir)
    for (const [key, value] of Object.entries(parsePo(readFileSync(file, 'utf8')))) {
      if (value === '') continue // an untranslated entry says nothing about the existing value
      project.locale(code).set(key, value, scope)
      imported += 1
    }
  }

  project.save()
  log.success(`Imported ${imported} translations from ${files.length} PO files.`)
}
