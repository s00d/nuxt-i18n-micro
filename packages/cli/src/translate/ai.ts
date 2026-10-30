import { usageError } from '../errors'
import { type RequestOptions, jsonBody, requestJson } from '../http'
import type { BatchRequest, Driver } from './drivers'

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1'
const OPENAI_URL = 'https://api.openai.com/v1'
const ANTHROPIC_URL = 'https://api.anthropic.com/v1'
const DEFAULT_GATEWAY_MODEL = 'anthropic/claude-sonnet-4.5'

interface ChatResponse {
  choices?: Array<{ finish_reason?: string; message?: { content?: string | null; refusal?: string | null } }>
}

interface AnthropicResponse {
  stop_reason?: string
  content?: Array<{ type: string; text?: string }>
}

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: { translations: { type: 'array', items: { type: 'string' } } },
  required: ['translations'],
  additionalProperties: false,
}

function systemPrompt({ from, to, options }: BatchRequest): string {
  const lines = [
    `You are a professional localizer translating software UI text from ${from} to ${to}.`,
    'Rules:',
    '1. Tags such as <v0/> are placeholders: keep each one exactly as it is, in the place the grammar needs.',
    '2. Preserve all other HTML/XML tags.',
    '3. Text separated by "|" holds plural forms: keep the separators and translate each form.',
    '4. Answer with JSON: {"translations": [...]}, one string per input string, in the same order. No explanations.',
  ]
  if (options.translationContext) lines.push(`Context: ${options.translationContext}`)
  if (options.glossaryContext) lines.push('Glossary (must be followed when a term appears):', options.glossaryContext)
  return lines.join('\n')
}

const userPrompt = (texts: string[]): string => JSON.stringify(texts)

function parseTranslations(content: string | null | undefined, reason: string | undefined, count: number): string[] {
  if (reason === 'length' || reason === 'max_tokens')
    throw usageError('AI: the answer was cut off.', ['Lower --chunkSize or raise --options maxTokens:<n>.'])
  if (!content) throw usageError('AI: empty answer.')
  const parsed = JSON.parse(content) as { translations?: unknown }
  const translations = parsed.translations
  if (!Array.isArray(translations) || translations.length !== count) throw usageError(`AI: expected ${count} translations.`, ['Lower --chunkSize.'])
  return translations.map(String)
}

const envKey = (name: string): string | undefined => process.env[name]?.trim() || undefined

function resolveKey(provider: string, token: string): string {
  const name = `${provider === 'gateway' ? 'AI_GATEWAY' : provider.toUpperCase()}_API_KEY`
  const key = token.trim() || envKey(name)
  if (!key) throw usageError(`AI provider "${provider}" needs a key.`, [`Set I18N_TRANSLATE_TOKEN or ${name}.`])
  return key
}

async function viaChatCompletions(request: BatchRequest, url: string, model: string, key: string, strict: boolean): Promise<string[]> {
  const { texts, options, http } = request
  const { headers, ...payload } = jsonBody({
    model,
    max_tokens: options.maxTokens ? Number(options.maxTokens) : undefined,
    messages: [
      { role: 'system', content: systemPrompt(request) },
      { role: 'user', content: userPrompt(texts) },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'translations', schema: OUTPUT_SCHEMA, ...(strict ? { strict: true } : {}) } },
  })
  const init: RequestOptions = { method: 'POST', ...http, ...payload, headers: { ...headers, Authorization: `Bearer ${key}` } }
  const data = await requestJson<ChatResponse>(`${url}/chat/completions`, init)
  const choice = data.choices?.[0]
  if (choice?.message?.refusal) throw usageError(`AI refused: ${choice.message.refusal}`)
  return parseTranslations(choice?.message?.content, choice?.finish_reason, texts.length)
}

/** Anthropic's OpenAI layer ignores `response_format`, so structured output needs the native API. */
async function viaAnthropic(request: BatchRequest, url: string, model: string, key: string): Promise<string[]> {
  const { texts, options, http } = request
  const { headers, ...payload } = jsonBody({
    model,
    max_tokens: Number(options.maxTokens ?? 8192),
    system: systemPrompt(request),
    messages: [{ role: 'user', content: userPrompt(texts) }],
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
  })
  const data = await requestJson<AnthropicResponse>(`${url}/messages`, {
    method: 'POST',
    ...http,
    ...payload,
    headers: { ...headers, 'x-api-key': key, 'anthropic-version': '2023-06-01' },
  })
  return parseTranslations(data.content?.find((block) => block.type === 'text')?.text, data.stop_reason, texts.length)
}

export const aiDriver: Driver = {
  label: 'AI',
  maxBatch: 20,
  keyOptional: true,
  translate(request) {
    const { options, token } = request
    const baseUrl = options.baseUrl?.replace(/\/+$/, '')
    const provider = (options.provider ?? (baseUrl ? 'custom' : 'gateway')).toLowerCase()
    const model = options.model ?? (provider === 'gateway' ? DEFAULT_GATEWAY_MODEL : undefined)
    if (!model) throw usageError('AI translation needs a model.', ['Example: --options provider:openai,model:gpt-4o-mini'])
    if (provider === 'gateway' && !model.includes('/'))
      throw usageError('Gateway models are written provider/model.', [`Example: --options model:${DEFAULT_GATEWAY_MODEL}`])

    const key = provider === 'custom' ? token : resolveKey(provider, token)
    if (provider === 'anthropic') return viaAnthropic(request, baseUrl ?? ANTHROPIC_URL, model, key)
    if (provider === 'openai') return viaChatCompletions(request, baseUrl ?? OPENAI_URL, model, key, true)
    if (provider === 'gateway') return viaChatCompletions(request, baseUrl ?? GATEWAY_URL, model, key, false)
    if (!baseUrl)
      throw usageError(`Unknown AI provider "${provider}".`, ['Use gateway, openai or anthropic, or set baseUrl to an OpenAI-compatible server.'])
    return viaChatCompletions(request, baseUrl, model, key, false)
  },
}
