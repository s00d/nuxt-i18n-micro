/**
 * Shared stress profile for performance fixtures.
 * Defaults match the CLI (`--locales 4 --keys 10000`, index+page).
 * Override via `runtime.json` written by `pnpm -C scripts cli performance`.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOCALE_POOL = [
  { code: 'en', iso: 'en-US', language: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', language: 'de-DE', displayName: 'German' },
  { code: 'ru', iso: 'ru-RU', language: 'ru-RU', displayName: 'Russian' },
  { code: 'fr', iso: 'fr-FR', language: 'fr-FR', displayName: 'French' },
  { code: 'es', iso: 'es-ES', language: 'es-ES', displayName: 'Spanish' },
  { code: 'it', iso: 'it-IT', language: 'it-IT', displayName: 'Italian' },
  { code: 'pt', iso: 'pt-PT', language: 'pt-PT', displayName: 'Portuguese' },
  { code: 'nl', iso: 'nl-NL', language: 'nl-NL', displayName: 'Dutch' },
  { code: 'pl', iso: 'pl-PL', language: 'pl-PL', displayName: 'Polish' },
  { code: 'ja', iso: 'ja-JP', language: 'ja-JP', displayName: 'Japanese' },
  { code: 'zh', iso: 'zh-CN', language: 'zh-CN', displayName: 'Chinese' },
  { code: 'ko', iso: 'ko-KR', language: 'ko-KR', displayName: 'Korean' },
]

const DEFAULT_PROFILE = {
  locales: LOCALE_POOL.slice(0, 4),
  depth: 5,
  branch: 7,
  secondaryDepth: 5,
  secondaryBranch: 6,
  pages: [
    { name: 'index', kind: 'index' },
    { name: 'page', kind: 'secondary' },
  ],
}

function loadRuntime() {
  const runtimePath = join(dirname(fileURLToPath(import.meta.url)), 'runtime.json')
  if (!existsSync(runtimePath)) return DEFAULT_PROFILE
  try {
    const raw = JSON.parse(readFileSync(runtimePath, 'utf8'))
    return {
      locales: Array.isArray(raw.locales) && raw.locales.length > 0 ? raw.locales : DEFAULT_PROFILE.locales,
      depth: raw.depth ?? DEFAULT_PROFILE.depth,
      branch: raw.branch ?? DEFAULT_PROFILE.branch,
      secondaryDepth: raw.secondaryDepth ?? DEFAULT_PROFILE.secondaryDepth,
      secondaryBranch: raw.secondaryBranch ?? DEFAULT_PROFILE.secondaryBranch,
      pages: Array.isArray(raw.pages) && raw.pages.length > 0 ? raw.pages : DEFAULT_PROFILE.pages,
    }
  } catch {
    return DEFAULT_PROFILE
  }
}

const runtime = loadRuntime()

export const PERF_LOCALES = runtime.locales
export const PERF_DEPTH = runtime.depth
export const PERF_BRANCH = runtime.branch
export const PERF_LEAF_KEYS = PERF_BRANCH ** PERF_DEPTH
export const PERF_SECONDARY_DEPTH = runtime.secondaryDepth
export const PERF_SECONDARY_BRANCH = runtime.secondaryBranch
export const PERF_SECONDARY_LEAF_KEYS = PERF_SECONDARY_BRANCH ** PERF_SECONDARY_DEPTH
export const PERF_PAGES = runtime.pages
export const PERF_PAGE_NAMES = PERF_PAGES.map((p) => p.name)
export const PERF_LOCALE_CODES = PERF_LOCALES.map((l) => l.code)

const LOREM = {
  en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  de: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  ru: 'Лорем ипсум долор сит амет, консектетуэр адиписцинг элит. Сед до эиусмод темпор инцидидунт ут лаборе эт долоре магна аликуа.',
  fr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  es: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  it: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  pt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  nl: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  pl: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  ja: 'これはパフォーマンステスト用のダミー翻訳テキストです。キーツリーを大きく保ち回帰を早期に検出します。',
  zh: '这是用于性能测试的占位翻译文本。保持大型键树以便尽早发现回归。',
  ko: '성능 테스트용 더미 번역 텍스트입니다. 회귀를 일찍 잡기 위해 큰 키 트리를 유지합니다.',
}

const WELCOME = {
  en: 'Welcome, {username}! You have {unreadCount} unread messages.',
  de: 'Willkommen, {username}! Sie haben {unreadCount} ungelesene Nachrichten.',
  ru: 'Добро пожаловать, {username}! У вас {unreadCount} непрочитанных сообщений.',
  fr: 'Bienvenue, {username}! Vous avez {unreadCount} messages non lus.',
  es: '¡Bienvenido, {username}! Tienes {unreadCount} mensajes no leídos.',
  it: 'Benvenuto, {username}! Hai {unreadCount} messaggi non letti.',
  pt: 'Bem-vindo, {username}! Tem {unreadCount} mensagens não lidas.',
  nl: 'Welkom, {username}! Je hebt {unreadCount} ongelezen berichten.',
  pl: 'Witaj, {username}! Masz {unreadCount} nieprzeczytanych wiadomości.',
  ja: 'ようこそ、{username}さん！未読メッセージが {unreadCount} 件あります。',
  zh: '欢迎，{username}！您有 {unreadCount} 条未读消息。',
  ko: '환영합니다, {username}님! 읽지 않은 메시지가 {unreadCount}개 있습니다.',
}

const PAGE_KEY1 = {
  en: 'page en',
  de: 'page de',
  ru: 'page ru',
  fr: 'page fr',
  es: 'page es',
  it: 'page it',
  pt: 'page pt',
  nl: 'page nl',
  pl: 'page pl',
  ja: 'page ja',
  zh: 'page zh',
  ko: 'page ko',
}

const ROOT_KEY1 = {
  en: 'en en en',
  de: 'de de de',
  ru: 'ru ru ru',
  fr: 'fr fr fr',
  es: 'es es es',
  it: 'it it it',
  pt: 'pt pt pt',
  nl: 'nl nl nl',
  pl: 'pl pl pl',
  ja: 'ja ja ja',
  zh: 'zh zh zh',
  ko: 'ko ko ko',
}

function wordsForLocale(locale) {
  const source = LOREM[locale] || LOREM.en
  const spaced = source.split(/\s+/).filter(Boolean)
  if (spaced.length >= 4) return spaced

  const chars = [...source.replace(/\s+/g, '')]
  const chunks = []
  for (let i = 0; i < chars.length; i += 4) {
    chunks.push(chars.slice(i, i + 4).join(''))
  }
  return chunks.length > 0 ? chunks : ['text']
}

export function generateText(locale, seed) {
  const words = wordsForLocale(locale)
  const length = (seed % 10) + 5
  let result = ''
  for (let i = 0; i < length; i++) {
    result += `${words[(seed + i) % words.length]} `
  }
  return result.trim()
}

/** Deterministic nested dictionary: BRANCH^DEPTH leaf strings. */
export function generateStressTree(locale, depth = PERF_DEPTH, branch = PERF_BRANCH, seed = 0) {
  const translations = {}
  const localeSeed = Math.max(0, PERF_LOCALE_CODES.indexOf(locale)) * 10_000

  for (let i = 0; i < branch; i++) {
    const key = `key${i}`
    if (depth > 1) {
      translations[key] = generateStressTree(locale, depth - 1, branch, seed + i * 100 + localeSeed)
    } else {
      translations[key] = generateText(locale, seed + i + localeSeed)
    }
  }

  return translations
}

export function nestKey1(value) {
  return { key1: { key1: { key1: { key1: { key1: value } } } } }
}

export function generateIndexTranslations(locale) {
  const tree = generateStressTree(locale)
  tree.key1.key1.key1.key1.key1 = ROOT_KEY1[locale] || ROOT_KEY1.en
  return {
    title: `index · ${locale}`,
    heading: `Stress page index (${locale})`,
    welcome: WELCOME[locale] || WELCOME.en,
    ...tree,
  }
}

export function generatePageTranslations(locale, pageName = 'page') {
  const pageSeed = Math.max(0, PERF_PAGE_NAMES.indexOf(pageName)) * 1_000_000
  const tree = generateStressTree(locale, PERF_SECONDARY_DEPTH, PERF_SECONDARY_BRANCH, pageSeed)
  tree.key1.key1.key1.key1.key1 = PAGE_KEY1[locale] || PAGE_KEY1.en

  return {
    title: `${pageName} · ${locale}`,
    heading: `Stress page ${pageName} (${locale})`,
    welcome: WELCOME[locale] || WELCOME.en,
    apples: 'no apples | one apple | {count} apples',
    feedback: {
      text: 'test link: {link}',
      link: 'click',
    },
    ...tree,
  }
}

export function generateRootTranslations(locale) {
  return nestKey1(ROOT_KEY1[locale] || ROOT_KEY1.en)
}

export function generateTranslationsForPage(pageName, locale) {
  if (pageName === 'index') return generateIndexTranslations(locale)
  return generatePageTranslations(locale, pageName)
}

export function generateMergedLocaleFile(locale) {
  const merged = {
    ...generateIndexTranslations(locale),
  }

  for (const page of PERF_PAGES) {
    if (page.name === 'index') continue
    merged[page.name] = generatePageTranslations(locale, page.name)
  }

  const pagePayload = merged.page
  if (pagePayload) {
    merged.welcome = pagePayload.welcome
    merged.apples = pagePayload.apples
    merged.feedback = pagePayload.feedback
  }

  return merged
}

export function fixtureProfileMarkdown() {
  return `### Fixture profile

| Knob | Value |
|------|-------|
| Locales | **${PERF_LOCALE_CODES.length}** (\`${PERF_LOCALE_CODES.join('`, `')}\`) |
| Pages | **${PERF_PAGE_NAMES.length}** (\`${PERF_PAGE_NAMES.join('`, `')}\`) |
| Index tree | depth **${PERF_DEPTH}**, branch **${PERF_BRANCH}** → **${PERF_LEAF_KEYS.toLocaleString('en-US')}** leaf keys / locale |
| Secondary pages | depth **${PERF_SECONDARY_DEPTH}**, branch **${PERF_SECONDARY_BRANCH}** → **${PERF_SECONDARY_LEAF_KEYS.toLocaleString('en-US')}** leaf keys / page / locale |

Dictionaries come from \`runtime.json\` (written by the performance CLI) or built-in defaults.
`
}
