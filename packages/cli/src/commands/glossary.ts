import { resolve } from 'node:path'
import { validationError } from '../errors'
import { writeJson } from '../fs'
import { type Glossary, addEntry, loadGlossary, removeEntries } from '../glossary'
import { log } from '../log'

export interface GlossaryArgs {
  cwd?: string
  file: string
  action: 'list' | 'add' | 'remove'
  source?: string
  target?: string
  from?: string
  to?: string
  json?: boolean
}

function list(glossary: Glossary, args: GlossaryArgs): void {
  if (args.json) {
    log.json(glossary)
    return
  }
  if (glossary.entries.length === 0) {
    log.info('Glossary is empty.')
    return
  }
  log.info(`Glossary entries (${glossary.entries.length}):`)
  for (const { source, target, from, to } of glossary.entries) {
    log.info(`- ${source} => ${target}${from || to ? ` [${from || '*'} -> ${to || '*'}]` : ''}`)
  }
}

function add(glossary: Glossary, args: GlossaryArgs, path: string): void {
  if (!args.source || !args.target) {
    throw validationError('--source and --target are required for --action add', [
      'Example: i18n-micro glossary --action add --source Hello --target Hallo',
    ])
  }
  addEntry(glossary, { source: args.source, target: args.target, from: args.from, to: args.to })
  writeJson(path, glossary)
  log.success('Glossary entry added.')
}

function remove(glossary: Glossary, args: GlossaryArgs, path: string): void {
  if (!args.source) throw validationError('--source is required for --action remove', ['Example: i18n-micro glossary --action remove --source Hello'])
  const removed = removeEntries(glossary, { source: args.source, from: args.from, to: args.to })
  if (removed === 0) {
    log.warn('No matching glossary entries found.')
    return
  }
  writeJson(path, glossary)
  log.success(`Removed ${removed} glossary ${removed === 1 ? 'entry' : 'entries'}.`)
}

export default async function run(args: GlossaryArgs): Promise<void> {
  const path = resolve(args.cwd ?? '.', args.file)
  const glossary = loadGlossary(path)
  if (args.action === 'add') add(glossary, args, path)
  else if (args.action === 'remove') remove(glossary, args, path)
  else list(glossary, args)
}
