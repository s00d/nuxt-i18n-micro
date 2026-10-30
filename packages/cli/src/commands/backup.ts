import { readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { encrypt } from '../backup'
import { notFoundError, validationError } from '../errors'
import { walkFiles, writeFileAtomic } from '../fs'
import { log } from '../log'
import { Project } from '../project'
import { createZip } from '../zip'

export interface BackupArgs {
  cwd?: string
  translationDir?: string
  backupDir?: string
  password?: string
  comment?: string
}

const stamp = (): string => new Date().toISOString().replace(/[:.]/g, '-')

export default async function run(args: BackupArgs): Promise<void> {
  if (args.password === '') throw validationError('--password cannot be empty')
  const project = await Project.load(args)
  const { rootDir, translationDir } = project.config
  const backupDir = args.backupDir ? resolve(rootDir, args.backupDir) : join(translationDir, 'backups')

  // Without this every backup would carry all the previous ones.
  const files = walkFiles(translationDir, (path) => !path.startsWith(`${backupDir}${sep}`))
  if (files.length === 0) throw notFoundError('Translation directory has no files to back up.', [], { Path: translationDir })

  const zip = createZip(files.map((file) => ({ name: relative(translationDir, file).split(sep).join('/'), data: readFileSync(file) })))
  const comment = args.comment ? `-${args.comment.replace(/[^a-z0-9-]/gi, '-')}` : ''
  const target = join(backupDir, `${stamp()}${comment}.zip`)
  writeFileAtomic(target, args.password ? encrypt(zip, args.password) : zip)
  log.success(`Backup created: ${relative(rootDir, target)}`)
}
