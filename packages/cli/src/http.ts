import { CliError } from './errors'

export interface RequestOptions extends Omit<RequestInit, 'signal'> {
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504])

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** What a URL may show in an error: query strings carry API keys (`?key=`). */
const safeUrl = (url: string): string => url.split(/[?#;]/)[0]!.replace(/^([a-z][a-z0-9+.-]*:\/\/)?.*@/i, '$1')

function messageFromBody(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: unknown; error?: unknown; error_msg?: unknown; errorMessage?: unknown }
    const nested = (parsed.error as { message?: unknown } | undefined)?.message
    const found = [parsed.message, nested, parsed.error, parsed.error_msg, parsed.errorMessage].find((value) => typeof value === 'string')
    if (found) return found as string
  } catch {
    // Not JSON: fall through to the raw text.
  }
  return body.slice(0, 300)
}

function httpError(response: Response, url: string, body: string): CliError {
  const hints =
    response.status === 401 || response.status === 403
      ? ['Check the API token and its permissions.']
      : response.status === 429
        ? ['Rate limit reached: lower --chunkSize or set --options retries:5,retryDelayMs:2000.']
        : []
  return new CliError(messageFromBody(body) || `HTTP ${response.status}`, {
    code: 'HTTP_ERROR',
    hints,
    details: { 'HTTP status': String(response.status), URL: safeUrl(url) },
  })
}

const retryAfterMs = (response: Response): number | null => {
  const seconds = Number(response.headers.get('retry-after'))
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null
}

async function attempt(url: string, options: RequestOptions, retriesLeft: number, delayMs: number): Promise<Response> {
  const { timeoutMs = 30_000, retries: _retries, retryDelayMs: _delay, ...init } = options
  let response: Response
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  } catch (error) {
    if (retriesLeft > 0) {
      await sleep(delayMs)
      return attempt(url, options, retriesLeft - 1, delayMs * 2)
    }
    // The runtime quotes the whole URL when it cannot parse one, query string included.
    const scrub = (text: string): string => text.replaceAll(url, safeUrl(url))
    // A new error, so `--debug` prints this text and not the runtime's stack, which quotes the URL too.
    const cause = new Error(scrub((error as Error).message))
    throw new CliError(`Request failed: ${cause.message}`, { code: 'HTTP_ERROR', details: { URL: safeUrl(url) }, cause })
  }
  if (response.ok) return response
  if (RETRYABLE.has(response.status) && retriesLeft > 0) {
    await sleep(retryAfterMs(response) ?? delayMs)
    return attempt(url, options, retriesLeft - 1, delayMs * 2)
  }
  throw httpError(response, url, await response.text())
}

export const request = (url: string, options: RequestOptions = {}): Promise<Response> =>
  attempt(url, options, options.retries ?? 2, options.retryDelayMs ?? 500)

export async function requestJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const response = await request(url, options)
  const text = await response.text()
  if (text === '') return undefined as T
  try {
    return JSON.parse(text) as T
  } catch (error) {
    throw new CliError('The service did not return JSON.', { code: 'HTTP_ERROR', details: { URL: safeUrl(url) }, cause: error })
  }
}

export const jsonBody = (value: unknown): Pick<RequestInit, 'body'> & { headers: Record<string, string> } => ({
  body: JSON.stringify(value),
  headers: { 'Content-Type': 'application/json' },
})
