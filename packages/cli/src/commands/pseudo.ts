import { notFoundError, validationError } from '../errors'
import { log } from '../log'
import { Project } from '../project'
import { protect, restore } from '../translate/protect'

export interface PseudoArgs {
  cwd?: string
  translationDir?: string
  sourceLocale?: string
  targetLocale: string
  replace?: boolean
}

const elongate = (text: string): string =>
  text
    .split(/(<v\d+\/>)/)
    .map((chunk) => (/^<v\d+\/>$/.test(chunk) ? chunk : chunk.replace(/[a-z]/gi, '$&$&')))
    .join('')

export function pseudoLocalize(text: string): string {
  const { masked, tokens } = protect(text)
  return restore(`[${elongate(masked)}]`, tokens)
}

export default async function run(args: PseudoArgs): Promise<void> {
  const project = await Project.load(args)
  const sourceCode = args.sourceLocale ?? project.config.defaultLocale
  if (sourceCode === args.targetLocale) throw validationError('Source and target locale must be different')
  if (!project.codes.includes(args.targetLocale)) {
    throw notFoundError(`Locale ${args.targetLocale} not found`, ['Add it to i18n.locales in nuxt.config first.'])
  }

  const source = project.locale(sourceCode)
  const target = project.locale(args.targetLocale)
  let updated = 0
  let skipped = 0

  for (const scope of source.scopes) {
    for (const [key, value] of Object.entries(source.strings(scope))) {
      const current = target.get(key, scope)
      if (!args.replace && typeof current === 'string' && current.trim() !== '') {
        skipped += 1
        continue
      }
      target.set(key, pseudoLocalize(value), scope)
      updated += 1
    }
  }

  project.save()
  log.success(`Pseudo locale generated: ${sourceCode} -> ${args.targetLocale}`)
  log.info(`Updated keys: ${updated}, skipped keys: ${skipped}`)
}
