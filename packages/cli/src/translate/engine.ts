import { commandFailed, usageError } from '../errors'
import type { BatchRequest, Driver, DriverOptions } from './drivers'
import { drivers, removedServices } from './drivers'
import { isIntact, protect, restore } from './protect'

export interface TranslateItem {
  key: string
  text: string
}

export interface TranslationResult {
  key: string
  value: string
}

export interface EngineOptions {
  service: string
  token: string
  options: DriverOptions
  chunkSize?: number
  pluralSeparator: string
}

export function resolveDriver(service: string): Driver {
  const name = service.toLowerCase()
  const driver = drivers[name]
  if (driver) return driver
  const reason = removedServices[name]
  if (reason) throw usageError(`Translation service "${service}" was removed: ${reason}`)
  throw usageError(`Unsupported translation service: ${service}`, [`Supported: ${Object.keys(drivers).join(', ')}`])
}

/** Parses `key:value,key:value`. Only the first colon splits: values are often URLs. */
export function parseOptions(text: string | undefined): DriverOptions {
  const options: DriverOptions = {}
  for (const pair of (text ?? '').split(',')) {
    const separator = pair.indexOf(':')
    if (separator <= 0) continue
    options[pair.slice(0, separator).trim()] = pair.slice(separator + 1).trim()
  }
  return options
}

/** Batches within what the service accepts, by count and by characters. */
export function buildBatches<T>(items: T[], size: (item: T) => number, maxCount: number, maxChars = Number.POSITIVE_INFINITY): T[][] {
  const batches: T[][] = []
  let current: T[] = []
  let chars = 0

  for (const item of items) {
    const itemChars = size(item)
    if (current.length >= maxCount || (current.length > 0 && chars + itemChars > maxChars)) {
      batches.push(current)
      current = []
      chars = 0
    }
    current.push(item)
    chars += itemChars
  }
  if (current.length > 0) batches.push(current)
  return batches
}

interface Segment {
  index: number
  masked: string
  tokens: string[]
}

const httpOptions = (options: DriverOptions): BatchRequest['http'] => ({
  retries: options.retries ? Number(options.retries) : undefined,
  retryDelayMs: options.retryDelayMs ? Number(options.retryDelayMs) : undefined,
  timeoutMs: options.timeoutMs ? Number(options.timeoutMs) : undefined,
})

function splitForms(text: string, separator: string): string[] {
  return separator && text.includes(separator) ? text.split(separator).map((part) => part.trim()) : [text]
}

async function translateSegments(driver: Driver, segments: Segment[], base: Omit<BatchRequest, 'texts'>, config: EngineOptions): Promise<string[]> {
  const out = Array.from<string>({ length: segments.length })
  const maxCount = Math.min(config.chunkSize ?? driver.maxBatch, driver.maxBatch)
  const positions = segments.map((segment, position) => ({ segment, position }))

  for (const batch of buildBatches(positions, (item) => item.segment.masked.length, maxCount, driver.maxChars)) {
    // oxlint-disable-next-line no-await-in-loop -- one request at a time: every vendor rate-limits, and order keeps runs reproducible
    const translated = await driver.translate({ ...base, texts: batch.map((item) => item.segment.masked) })
    if (translated.length !== batch.length) {
      throw commandFailed(`${driver.label} returned ${translated.length} translations for ${batch.length} strings.`, [
        'Nothing from this batch was written.',
      ])
    }
    for (const [offset, item] of batch.entries()) out[item.position] = translated[offset]!
  }
  return out
}

export interface EngineResult {
  translated: TranslationResult[]
  /** Keys whose placeholders did not survive: left untranslated rather than broken. */
  rejected: string[]
}

/** Translate one list of messages, plural forms and placeholders handled, into `to`. */
export async function translateItems(
  items: TranslateItem[],
  from: string,
  to: string,
  config: EngineOptions,
  extra: DriverOptions = {},
): Promise<EngineResult> {
  const driver = resolveDriver(config.service)
  const segments = items.flatMap((item, index) =>
    splitForms(item.text, config.pluralSeparator).map((form) => {
      const { masked, tokens } = protect(form)
      return { index, masked, tokens }
    }),
  )
  const options = { ...config.options, ...extra }
  const base = {
    from: driver.sourceLang?.(from) ?? from,
    to: driver.targetLang?.(to) ?? to,
    token: config.token,
    options,
    http: httpOptions(options),
  }

  const results = await translateSegments(driver, segments, base, config)
  const forms = new Map<number, string[]>()
  const broken = new Set<number>()

  for (const [position, segment] of segments.entries()) {
    const value = restore(results[position]!, segment.tokens)
    if (value === '' || !isIntact(value, segment.tokens)) broken.add(segment.index)
    forms.set(segment.index, [...(forms.get(segment.index) ?? []), value])
  }

  const joiner = ` ${config.pluralSeparator} `
  return {
    translated: items.flatMap((item, index) => (broken.has(index) ? [] : [{ key: item.key, value: forms.get(index)!.join(joiner) }])),
    rejected: items.filter((_item, index) => broken.has(index)).map((item) => item.key),
  }
}
