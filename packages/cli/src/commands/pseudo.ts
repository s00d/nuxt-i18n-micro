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

/** Tags, masked placeholders among them, and entities are markup: split on them, the odd chunks are theirs. */
const elongate = (text: string): string =>
  text
    .split(/(<\/?[a-z][^<>]*>|&#?\w+;)/i)
    .map((chunk, index) => (index % 2 === 1 ? chunk : chunk.replace(/[a-z]/gi, '$&$&')))
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
      const kept = !args.replace && current !== undefined && (typeof current !== 'string' || current.trim() !== '')
      const conflict = kept ? null : target.set(key, pseudoLocalize(value), scope)
      if (conflict) log.warn(`Skipping ${key}: ${conflict} already holds a value.`)
      if (kept || conflict) skipped += 1
      else updated += 1
    }
  }

  project.save()
  log.success(`Pseudo locale generated: ${sourceCode} -> ${args.targetLocale}`)
  log.info(`Updated keys: ${updated}, skipped keys: ${skipped}`)
}
