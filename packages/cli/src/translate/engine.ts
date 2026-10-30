import { commandFailed, usageError } from '../errors'
import { ownValue } from '../json'
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
  const driver = ownValue(drivers, name)
  if (driver) return driver
  const reason = ownValue(removedServices, name)
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
  /** The item this form belongs to. */
  index: number
  masked: string
  tokens: string[]
  translated?: string
}

const httpOptions = (options: DriverOptions): BatchRequest['http'] => ({
  retries: options.retries ? Number(options.retries) : undefined,
  retryDelayMs: options.retryDelayMs ? Number(options.retryDelayMs) : undefined,
  timeoutMs: options.timeoutMs ? Number(options.timeoutMs) : undefined,
})

function splitForms(text: string, separator: string): string[] {
  return separator && text.includes(separator) ? text.split(separator).map((part) => part.trim()) : [text]
}

export interface EngineResult {
  translated: TranslationResult[]
  /** Keys with no usable answer, a placeholder lost or no text: left untranslated rather than broken. */
  rejected: string[]
}

/** The finished value of an item, or `null` when a placeholder got lost on the way. */
function assemble(segments: Segment[], joiner: string): string | null {
  const values = segments.map((segment) => restore(segment.translated!, segment.tokens))
  const intact = values.every((value, position) => value !== '' && isIntact(value, segments[position]!.tokens))
  return intact ? values.join(joiner) : null
}

/**
 * Translate one list of messages, plural forms and placeholders handled, into `to`.
 *
 * `onBatch` hears about every item as soon as its last form is back, so what was paid for can
 * be saved before the next request. A failed request throws, and costs only what it carried.
 */
export async function translateItems(
  items: TranslateItem[],
  from: string,
  to: string,
  config: EngineOptions,
  extra: DriverOptions = {},
  onBatch: (result: EngineResult) => void = () => {},
): Promise<EngineResult> {
  const driver = resolveDriver(config.service)
  const toSegment = (index: number, form: string): Segment => {
    const { masked, tokens } = protect(form)
    return { index, masked, tokens }
  }
  const formsOf = items.map((item, index) => splitForms(item.text, config.pluralSeparator).map((form) => toSegment(index, form)))
  const segments = formsOf.flat()
  const options = { ...config.options, ...extra }
  const base = {
    from: driver.sourceLang?.(from) ?? from,
    to: driver.targetLang?.(to) ?? to,
    token: config.token,
    options,
    http: httpOptions(options),
  }
  const total: EngineResult = { translated: [], rejected: [] }
  const joiner = ` ${config.pluralSeparator} `
  const maxCount = Math.min(config.chunkSize ?? driver.maxBatch, driver.maxBatch)

  for (const batch of buildBatches(segments, (segment) => segment.masked.length, maxCount, driver.maxChars)) {
    // oxlint-disable-next-line no-await-in-loop -- one request at a time: every vendor rate-limits, and order keeps runs reproducible
    const translated = await driver.translate({ ...base, texts: batch.map((segment) => segment.masked) })
    if (translated.length !== batch.length) {
      throw commandFailed(`${driver.label} returned ${translated.length} translations for ${batch.length} strings.`, [
        'Nothing from this batch was written.',
      ])
    }
    // Whatever a service answers: anything but text is reported by `assemble`, not written or dropped.
    for (const [position, segment] of batch.entries()) {
      const text: unknown = translated[position]
      segment.translated = typeof text === 'string' ? text : ''
    }

    const done: EngineResult = { translated: [], rejected: [] }
    for (const index of new Set(batch.map((segment) => segment.index))) {
      if (formsOf[index]!.some((form) => form.translated === undefined)) continue
      const value = assemble(formsOf[index]!, joiner)
      if (value === null) done.rejected.push(items[index]!.key)
      else done.translated.push({ key: items[index]!.key, value })
    }
    onBatch(done)
    total.translated.push(...done.translated)
    total.rejected.push(...done.rejected)
  }
  return total
}
