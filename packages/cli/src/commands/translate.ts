import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { findingsError, notFoundError, usageError } from '../errors'
import { splitList } from '../fs'
import { type Glossary, glossaryContext, loadGlossary } from '../glossary'
import { addSecret, addUrlSecrets, ask, choose, log } from '../log'
import { GLOBAL_SCOPE, type LocaleSet, Project } from '../project'
import { drivers } from '../translate/drivers'
import { type EngineOptions, parseOptions, resolveDriver, translateItems } from '../translate/engine'

export interface TranslateArgs {
  cwd?: string
  translationDir?: string
  service?: string
  token?: string
  options?: string
  locale?: string
  replace?: boolean
  dryRun?: boolean
  chunkSize?: number
  pluralSeparator: string
  glossaryFile?: string
}

const DEFAULT_GLOSSARY = '.i18n-glossary.json'

interface Job {
  scope: string
  items: Array<{ key: string; text: string }>
}

function jobsFor(reference: LocaleSet, locale: LocaleSet, replace: boolean): Job[] {
  return reference.scopes.flatMap((scope) => {
    const items = Object.entries(reference.strings(scope))
      .filter(([key, text]) => text !== '' && (replace || (locale.resolve(key, scope) ?? '') === ''))
      .map(([key, text]) => ({ key, text }))
    return items.length > 0 ? [{ scope, items }] : []
  })
}

async function resolveService(args: TranslateArgs): Promise<string> {
  const service = args.service ?? (await choose('Choose a translation service', Object.keys(drivers)))
  if (!service) throw usageError('Translation service is required.', ['Pass --service <name>.'])
  return service
}

async function resolveToken(args: TranslateArgs, keyOptional: boolean): Promise<string> {
  const token = args.token ?? process.env.I18N_TRANSLATE_TOKEN
  if (token || keyOptional) return token ?? ''
  const answer = await ask('API key:')
  if (!answer) throw usageError('This service needs an API key.', ['Set I18N_TRANSLATE_TOKEN or pass --token.'])
  return answer
}

function resolveGlossary(args: TranslateArgs, rootDir: string): Glossary | undefined {
  const path = resolve(rootDir, args.glossaryFile ?? DEFAULT_GLOSSARY)
  if (existsSync(path)) return loadGlossary(path)
  if (args.glossaryFile) throw notFoundError(`Glossary not found: ${path}`)
  return undefined
}

const contextOf = (scope: string, keys: string[]): string => {
  const shown = keys.slice(0, 10).join(', ')
  return `scope=${scope === GLOBAL_SCOPE ? 'global' : scope}; keys=${shown}${keys.length > 10 ? ` (+${keys.length - 10} more)` : ''}`
}

function printPlan(project: Project, codes: string[], replace: boolean): void {
  const rows = codes.map((code): [string, string] => {
    const items = jobsFor(project.reference, project.locale(code), replace).flatMap((job) => job.items)
    const chars = items.reduce((sum, item) => sum + item.text.length, 0)
    return [code, `${items.length} keys, ${chars} characters`]
  })
  log.section('To translate')
  log.rows(rows)
  log.info('Dry run: nothing was sent.')
}

export default async function run(args: TranslateArgs): Promise<void> {
  addSecret(args.token)
  // First: this also loads `.env`, where a token usually lives.
  const project = await Project.load(args)
  const { reference } = project
  const { defaultLocale, rootDir } = project.config
  const codes = project.selectLocales(splitList(args.locale))
  if (args.dryRun) {
    printPlan(project, codes, Boolean(args.replace))
    return
  }

  const service = await resolveService(args)
  const driver = resolveDriver(service)
  const token = await resolveToken(args, Boolean(driver.keyOptional))
  addSecret(token)
  const glossary = resolveGlossary(args, rootDir)
  const options = parseOptions(args.options)
  addUrlSecrets(options.baseUrl)
  const config: EngineOptions = {
    service,
    token,
    options,
    chunkSize: args.chunkSize,
    pluralSeparator: args.pluralSeparator,
  }

  const rejected: string[] = []
  let translated = 0

  for (const code of codes) {
    const locale = project.locale(code)
    log.info(`Translating locale: ${code}`)
    const glossaryText = glossary && glossaryContext(glossary, defaultLocale, code)

    for (const { scope, items } of jobsFor(reference, locale, Boolean(args.replace))) {
      const extra = {
        translationContext: contextOf(
          scope,
          items.map((item) => item.key),
        ),
        ...(glossaryText ? { glossaryContext: glossaryText } : {}),
      }
      // oxlint-disable-next-line no-await-in-loop -- sequential by design, see translateItems
      await translateItems(items, defaultLocale, code, config, extra, (result) => {
        // Translations are paid for: each batch is on disk before the next request goes out.
        for (const { key, value } of result.translated) {
          const conflict = locale.set(key, value, scope)
          if (conflict) rejected.push(`${code}: ${key} (${conflict} already holds a value)`)
          else translated += 1
        }
        rejected.push(...result.rejected.map((key) => `${code}: ${key} (a placeholder did not survive)`))
        project.save()
      })
    }
  }

  log.list('Not written', rejected)
  log.success(`Translated ${translated} strings.`)
  if (rejected.length > 0) throw findingsError(`${rejected.length} strings were not written.`, ['Fill them in by hand.'])
}
