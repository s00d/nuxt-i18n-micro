import { type JsonObject, isObject } from '../json'
import { log } from '../log'
import { Project } from '../project'

export interface SyncArgs {
  cwd?: string
  translationDir?: string
}

/** The shape of `reference` with the values of `target`; only a missing leaf becomes `''`. */
export function alignToReference(reference: JsonObject, target: JsonObject): JsonObject {
  const out: JsonObject = {}
  for (const [key, value] of Object.entries(reference)) {
    const current = target[key]
    if (isObject(value)) out[key] = alignToReference(value, isObject(current) ? current : {})
    else out[key] = current === undefined || isObject(current) ? '' : current
  }
  return out
}

export default async function run(args: SyncArgs): Promise<void> {
  const project = await Project.load(args)
  const { reference } = project

  for (const code of project.targetCodes) {
    const locale = project.locale(code)
    for (const scope of reference.scopes) locale.replaceTree(scope, alignToReference(reference.tree(scope), locale.tree(scope)))
  }

  project.save()
  log.success('Translations have been synchronized.')
}
