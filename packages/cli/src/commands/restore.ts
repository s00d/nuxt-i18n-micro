import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { decrypt, isEncrypted } from '../backup'
import { notFoundError, usageError } from '../errors'
import { writeFilesAtomic } from '../fs'
import { confirm, log } from '../log'
import { loadProjectConfig } from '../nuxt'
import { readZip } from '../zip'

export interface RestoreArgs {
  cwd?: string
  translationDir?: string
  backupDir?: string
  backup?: string
  password?: string
  force?: boolean
}

function listBackups(dir: string): string[] {
  if (!existsSync(dir)) throw notFoundError('Backup directory does not exist', ['Create a backup first: i18n-micro backup'], { Path: dir })
  const names = readdirSync(dir)
    .filter((name) => name.endsWith('.zip'))
    .sort((a, b) => b.localeCompare(a))
  if (names.length === 0) throw notFoundError('No backups found', ['Create a backup first: i18n-micro backup'], { Directory: dir })
  return names
}

function readArchive(path: string, password: string | undefined): Buffer {
  const data = readFileSync(path)
  if (!isEncrypted(data)) return data
  if (!password) throw usageError('This backup is encrypted.', ['Pass --password.'])
  return decrypt(data, password)
}

export default async function run(args: RestoreArgs): Promise<void> {
  // Not Project.load: a broken locale file is exactly what a restore has to get past.
  const { rootDir, translationDir: configured } = await loadProjectConfig(args.cwd ?? '.')
  const translationDir = args.translationDir ? resolve(rootDir, args.translationDir) : configured
  const backupDir = args.backupDir ? resolve(rootDir, args.backupDir) : join(translationDir, 'backups')
  const backups = listBackups(backupDir)

  if (!args.backup) {
    log.info('Available backups:')
    for (const [index, name] of backups.entries()) log.info(`${index + 1}. ${name}`)
    return
  }

  const wanted = args.backup
  const name = backups.find((backup) => backup === wanted) ?? backups.find((backup) => backup.startsWith(wanted))
  if (!name) throw notFoundError(`Backup "${wanted}" not found`, ['Run i18n-micro restore to list backups.'])

  // Checked before asking: a wrong password should not cost a confirmation.
  const entries = readZip(readArchive(join(backupDir, name), args.password)).filter((entry) => entry.name.endsWith('.json'))

  if (!args.force && !(await confirm('Restore this backup? Existing files will be overwritten.'))) {
    log.info('Restore cancelled')
    return
  }

  writeFilesAtomic(entries.map((entry) => [join(translationDir, entry.name), entry.data]))
  log.success(`Restored ${entries.length} files from backup "${name}"`)
}
