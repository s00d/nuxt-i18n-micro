import { resolve } from 'node:path'
import { usageError } from '../errors'
import { glossaryContext, loadGlossary } from '../glossary'
import { ask, choose, log } from '../log'
import { Project } from '../project'
import { drivers } from '../translate/drivers'
import { type EngineOptions, parseOptions, resolveDriver, translateItems } from '../translate/engine'
import { keysToTranslate } from './estimate'

export interface TranslateArgs {
  cwd?: string
  translationDir?: string
  service?: string
  token?: string
  options?: string
  replace?: boolean
  chunkSize?: number
  pluralSeparator: string
  glossaryFile?: string
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

const contextOf = (scope: string, keys: string[]): string => {
  const shown = keys.slice(0, 10).join(', ')
  return `scope=${scope}; keys=${shown}${keys.length > 10 ? ` (+${keys.length - 10} more)` : ''}`
}

export default async function run(args: TranslateArgs): Promise<void> {
  const service = await resolveService(args)
  const driver = resolveDriver(service)
  const token = await resolveToken(args, Boolean(driver.keyOptional))
  const project = await Project.load(args)
  const { reference } = project
  const { defaultLocale, rootDir } = project.config
  const glossary = args.glossaryFile ? loadGlossary(resolve(rootDir, args.glossaryFile)) : undefined
  const config: EngineOptions = {
    service,
    token,
    options: parseOptions(args.options),
    chunkSize: args.chunkSize,
    pluralSeparator: args.pluralSeparator,
  }

  const rejected: string[] = []
  let translated = 0

  for (const code of project.targetCodes) {
    const locale = project.locale(code)
    log.info(`Translating locale: ${code}`)
    const glossaryText = glossary && glossaryContext(glossary, defaultLocale, code)

    try {
      for (const scope of reference.scopes) {
        const source = reference.strings(scope)
        const keys = keysToTranslate(source, locale.strings(scope), Boolean(args.replace))
        if (keys.length === 0) continue
        const items = keys.map((key) => ({ key, text: source[key]! }))
        const extra = { translationContext: contextOf(scope, keys), ...(glossaryText ? { glossaryContext: glossaryText } : {}) }
        // oxlint-disable-next-line no-await-in-loop -- sequential by design, see translateSegments
        const result = await translateItems(items, defaultLocale, code, config, extra)
        for (const { key, value } of result.translated) locale.set(key, value, scope)
        translated += result.translated.length
        rejected.push(...result.rejected.map((key) => `${code}: ${key}`))
      }
    } finally {
      // Translations are paid for: what finished survives a failure in a later scope.
      // Each locale goes out as whole files, so a failed run leaves nothing half-written.
      project.save()
    }
  }

  log.list('Not written, placeholders did not survive', rejected)
  log.success(`Translated ${translated} strings.`)
}
