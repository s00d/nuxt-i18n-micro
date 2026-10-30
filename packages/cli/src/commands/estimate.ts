import { log } from '../log'
import { Project } from '../project'

export interface EstimateArgs {
  cwd?: string
  translationDir?: string
  replace?: boolean
  inputCostPer1kTokens: number
  outputCostPer1kTokens: number
  outputTokenRatio: number
  json?: boolean
}

export interface LocaleEstimate {
  code: string
  missingKeys: number
  inputChars: number
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}

/** Rough on purpose: about four characters per token. */
const estimateTokens = (text: string): number => Math.max(1, Math.ceil(text.length / 4))

export function keysToTranslate(reference: Record<string, string>, target: Record<string, unknown>, replace: boolean): string[] {
  return Object.keys(reference).filter((key) => replace || target[key] === undefined || target[key] === '')
}

function estimateLocale(project: Project, code: string, args: EstimateArgs): LocaleEstimate {
  const { reference } = project
  const locale = project.locale(code)
  const texts = reference.scopes.flatMap((scope) => {
    const source = reference.strings(scope)
    return keysToTranslate(source, locale.strings(scope), Boolean(args.replace)).map((key) => source[key]!)
  })
  const inputTokens = texts.reduce((sum, text) => sum + estimateTokens(text), 0)
  const outputTokens = Math.ceil(inputTokens * args.outputTokenRatio)
  return {
    code,
    missingKeys: texts.length,
    inputChars: texts.reduce((sum, text) => sum + text.length, 0),
    inputTokens,
    outputTokens,
    estimatedCost: (inputTokens / 1000) * args.inputCostPer1kTokens + (outputTokens / 1000) * args.outputCostPer1kTokens,
  }
}

export default async function run(args: EstimateArgs): Promise<void> {
  const project = await Project.load(args)
  const locales = project.targetCodes.map((code) => estimateLocale(project, code, args))
  const total = (field: keyof Omit<LocaleEstimate, 'code'>): number => locales.reduce((sum, locale) => sum + locale[field], 0)
  const summary = {
    totalLocales: locales.length,
    totalMissingKeys: total('missingKeys'),
    totalInputChars: total('inputChars'),
    totalInputTokens: total('inputTokens'),
    totalOutputTokens: total('outputTokens'),
    totalEstimatedCost: total('estimatedCost'),
  }

  if (args.json) {
    log.json({ summary, locales })
    return
  }
  log.rows([
    ['Locales to translate', summary.totalLocales],
    ['Missing keys', summary.totalMissingKeys],
    ['Input chars', summary.totalInputChars],
    ['Input tokens (approx)', summary.totalInputTokens],
    ['Output tokens (approx)', summary.totalOutputTokens],
    ['Estimated cost (USD)', summary.totalEstimatedCost.toFixed(4)],
  ])
}
