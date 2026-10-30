import { blockingLeaf } from '../json'
import { log } from '../log'
import { GLOBAL_SCOPE, Project } from '../project'
import { scanProject } from '../source'

export interface ExtractArgs {
  cwd?: string
  translationDir?: string
}

function addMissing(project: Project, key: string, scope: string): void {
  for (const code of project.codes) {
    const locale = project.locale(code)
    const blocker = blockingLeaf(locale.tree(scope), key)
    if (blocker) log.warn(`Skipping ${key} in ${code}: ${blocker} already holds a value.`)
    else if (locale.get(key, scope) === undefined) locale.set(key, '', scope)
  }
}

/** A page-file `''` would shadow a global value: a key the global file has stays global. */
const definedGlobally = (project: Project, key: string): boolean => project.codes.some((code) => project.locale(code).get(key) !== undefined)

export default async function run(args: ExtractArgs): Promise<void> {
  const project = await Project.load(args)
  const usage = scanProject(project.config)

  for (const { file, expression } of usage.dynamic) log.warn(`Dynamic i18n key in ${file}: ${expression}`)
  for (const key of usage.global) addMissing(project, key, GLOBAL_SCOPE)

  for (const [scope, keys] of Object.entries(usage.pages)) {
    for (const key of keys) {
      if (project.config.disablePageLocales) addMissing(project, key, GLOBAL_SCOPE)
      else if (!definedGlobally(project, key)) addMissing(project, key, scope)
    }
  }

  const written = project.save()
  log.success(`Scanned ${usage.files} files, updated ${written.length} translation files.`)
}
