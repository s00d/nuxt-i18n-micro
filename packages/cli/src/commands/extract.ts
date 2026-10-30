import { relative } from 'node:path'
import { splitList } from '../fs'
import { log } from '../log'
import { GLOBAL_SCOPE, Project } from '../project'
import { type ScopedRef, isOwnSource, scanProject } from '../source'

export interface ExtractArgs {
  cwd?: string
  translationDir?: string
  ignore?: string
}

const wanted = (ref: ScopedRef): boolean => !ref.guard && !ref.test

/**
 * Keys with a text of their own go to the default locale. A key without one stays absent:
 * `''` is a defined value, it would show a blank instead of the fallback locale.
 */
function addDefaultText(project: Project, ref: ScopedRef): boolean {
  const scope = ref.page && !project.config.disablePageLocales ? ref.page : GLOBAL_SCOPE
  const conflict = project.reference.set(ref.key, ref.defaultText!, scope)
  if (conflict) log.warn(`Skipping ${ref.key}: ${conflict} already holds a value.`)
  return !conflict
}

export default async function run(args: ExtractArgs): Promise<void> {
  const project = await Project.load(args)
  const { reference, config } = project
  const scan = scanProject(config, { ignore: splitList(args.ignore) })
  for (const { file, line, expression, group } of scan.dynamic) if (!group) log.warn(`Dynamic i18n key in ${file}:${line}: ${expression}`)

  const absent = (ref: ScopedRef): boolean => reference.resolve(ref.key, ref.page ?? GLOBAL_SCOPE) === undefined
  // Written here, a layer's key would shadow the text its layer adds later.
  const writable = (ref: ScopedRef): boolean => Boolean(ref.defaultText) && isOwnSource(config, ref.file)
  const added = scan.refs.filter((ref) => wanted(ref) && writable(ref) && absent(ref) && addDefaultText(project, ref))
  // A key that has its text and did not fit was warned about already.
  const untexted = scan.refs.filter((ref) => wanted(ref) && !writable(ref) && absent(ref))
  const written = project.save()

  log.list(
    `Need a text in ${config.defaultLocale}`,
    untexted.map((ref) => `${ref.key} (${relative(config.rootDir, ref.file)}:${ref.line})`),
  )
  log.success(`Scanned ${scan.files} files: ${added.length} keys added, ${untexted.length} without text, ${written.length} files updated.`)
}
