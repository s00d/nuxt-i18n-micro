// Every picture in the docs comes from here, in one style: diagrams as SVG (docs/public/diagrams),
// release banners and the social card as PNG. Run after editing: node scripts/render-docs-images.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const PUBLIC = new URL('../docs/public/', import.meta.url)
const INK = { bg: '#0c1211', card: '#141c1a', line: '#2c3b36', text: '#e8f0ed', dim: '#93a5a0', brand: '#5fe0ae', brandDim: '#1f9b72' }
const FONT = `Inter, -apple-system, 'Segoe UI', Roboto, sans-serif`
const MONO = `'SF Mono', Menlo, Consolas, monospace`

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** One text line per array item, centred on `cx`. The first line is the title. */
function lines(cx, cy, title, sub = []) {
  const all = [title, ...sub]
  const top = cy - ((all.length - 1) * 23) / 2 + 6
  return all
    .map((line, i) => {
      const style = i === 0 ? `font-size="18" font-weight="600" fill="${INK.text}"` : `font-size="15" fill="${INK.dim}"`
      return `<text x="${cx}" y="${top + i * 23}" text-anchor="middle" ${style}>${esc(line)}</text>`
    })
    .join('')
}

function box(x, y, w, h, title, sub, accent = false) {
  const stroke = accent ? INK.brandDim : INK.line
  const fill = accent ? '#10261f' : INK.card
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}"/>${lines(x + w / 2, y + h / 2, title, sub)}`
}

/** Line through the points; `label` sits next to its middle. */
function arrow(points, label, labelAt) {
  const path = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
  const text = label ? `<text x="${labelAt[0]}" y="${labelAt[1]}" font-size="14.5" fill="${INK.brand}" text-anchor="middle">${esc(label)}</text>` : ''
  return `<path d="${path}" fill="none" stroke="${INK.dim}" stroke-width="1.4" marker-end="url(#head)"/>${text}`
}

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="${FONT}">
<defs><marker id="head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${INK.dim}"/></marker></defs>
<rect width="${width}" height="${height}" rx="14" fill="${INK.bg}"/>${body}</svg>\n`
}

const diagrams = {
  'locale-detection': svg(
    960,
    520,
    [
      box(380, 24, 200, 52, 'Request'),
      arrow([[480, 76], [480, 112]]),
      box(340, 112, 280, 52, 'Locale prefix in the URL?', [], true),
      arrow([[340, 138], [176, 138], [176, 196]], 'yes', [262, 130]),
      box(60, 196, 232, 52, 'Render that locale'),
      arrow([[480, 164], [480, 196]], 'no', [498, 184]),
      box(380, 196, 200, 52, 'Which strategy?', [], true),
      arrow([[380, 222], [330, 222], [330, 288], [176, 288], [176, 312]], 'no_prefix', [254, 280]),
      box(36, 312, 280, 84, 'Render', ['?locale → state → cookie', '→ Accept-Language → default']),
      arrow([[480, 248], [480, 312]], 'prefix_and_default', [480, 284]),
      box(356, 312, 248, 84, 'Render the default locale', ['no redirect']),
      arrow([[580, 222], [784, 222], [784, 288]], 'prefix, prefix_except_default', [690, 212]),
      box(610, 288, 326, 52, 'autoDetectPath allows this path?', [], true),
      arrow([[720, 340], [720, 396], [640, 396], [640, 420]], 'yes', [700, 372]),
      box(476, 420, 268, 76, 'Redirect to', ['state → cookie', '→ Accept-Language → default']),
      arrow([[850, 340], [850, 420]], 'no', [866, 384]),
      box(764, 420, 172, 76, 'Path not allowed', ['prefix: by preference', 'else: default locale']),
    ].join(''),
  ),
  'translation-pipeline': svg(
    960,
    360,
    [
      box(24, 136, 170, 88, 'locales/**/*.json', ['every layer']),
      arrow([[194, 180], [240, 180]], 'build', [217, 170]),
      box(240, 136, 170, 88, 'Payload tree', ['premerged or source'], true),
      arrow([[410, 160], [448, 160], [448, 78], [476, 78]]),
      arrow([[410, 200], [448, 200], [448, 282], [476, 282]]),
      box(476, 40, 190, 76, 'public/', ['Node server']),
      box(476, 244, 190, 76, 'server assets', ['Edge, functions']),
      arrow([[666, 78], [716, 78], [716, 130], [716, 136]]),
      arrow([[666, 282], [716, 282], [716, 230], [716, 224]]),
      box(628, 136, 176, 88, 'Server loader', ['cached per page'], true),
      arrow([[804, 160], [846, 160], [846, 120]], 'SSR', [868, 146]),
      arrow([[804, 200], [846, 200], [846, 240]], 'fetch', [872, 216]),
      box(812, 64, 124, 56, '$t on server'),
      box(812, 240, 124, 56, '$t in browser'),
    ].join(''),
  ),
  strategies: svg(
    960,
    300,
    (() => {
      const rows = [
        ['prefix_except_default', '/about', '/de/about', 'default', 'No prefix for the default'],
        ['prefix', '/en/about', '/de/about', 'every locale', 'Prefix on every locale'],
        ['prefix_and_default', '/about, /en/about', '/de/about', 'both forms', 'Default works on both'],
        ['no_prefix', '/about', '/about', 'one URL', 'Locale is not in the URL'],
      ]
      const head = `<text x="44" y="46" font-size="14" fill="${INK.dim}">strategy</text><text x="340" y="46" font-size="14" fill="${INK.dim}">en (default)</text><text x="560" y="46" font-size="14" fill="${INK.dim}">de</text><text x="700" y="46" font-size="14" fill="${INK.dim}">what it means</text>`
      const body = rows.map(([name, en, de, , note], i) => {
        const y = 66 + i * 54
        return `<rect x="24" y="${y}" width="912" height="46" rx="9" fill="${i === 0 ? '#10261f' : INK.card}" stroke="${i === 0 ? INK.brandDim : INK.line}"/>
<text x="44" y="${y + 29}" font-size="16" font-weight="600" fill="${INK.text}" font-family="${MONO}">${name}</text>
<text x="340" y="${y + 29}" font-size="15.500" fill="${INK.brand}" font-family="${MONO}">${esc(en)}</text>
<text x="560" y="${y + 29}" font-size="15.500" fill="${INK.brand}" font-family="${MONO}">${esc(de)}</text>
<text x="700" y="${y + 29}" font-size="14.500" fill="${INK.dim}">${esc(note)}</text>`
      })
      return head + body.join('')
    })(),
  ),
  'page-dictionary': svg(
    960,
    280,
    [
      `<text x="24" y="34" font-size="15" fill="${INK.dim}">Lookup order: the first file that has the key wins</text>`,
      box(24, 56, 216, 76, 'pages/about/de.json', ['1. active locale, this page'], true),
      box(24, 148, 216, 76, 'de.json', ['2. active locale, shared'], true),
      box(272, 56, 216, 76, 'pages/about/en.json', ['3. fallback locale, this page']),
      box(272, 148, 216, 76, 'en.json', ['4. fallback locale, shared']),
      arrow([[240, 140], [272, 140]]),
      arrow([[488, 140], [530, 140]]),
      box(530, 96, 212, 88, 'about/de/data.json', ['one dictionary per page'], true),
      arrow([[742, 140], [790, 140]]),
      box(790, 108, 146, 64, '$t(key)'),
    ].join(''),
  ),
}

const LOGO = readFileSync(new URL('logo.svg', PUBLIC), 'utf-8')

const banners = {
  '3.24.0': ['Node SSR from public/, no Rollup raw:', ['Node SSR', 'public/ payloads', 'Smaller server']],
  '3.22.0': ['Formats, cache and translation memory', ['$tn / $td', 'Smart cache', 'resolveTranslations']],
  '3.21.0': ['useI18nHead for per-page SEO', ['useI18nHead', 'Per-page head', 'Reactive tags']],
  '3.20.0': ['Runtime layer refactor and redirect split', ['Runtime layer', 'Redirect plugin', 'Cleaner plugins']],
  '3.19.0': ['Utils and HMR packages, source payload mode', ['@i18n-micro/utils', 'HMR', 'Source payloads']],
  '3.0.0': ['Performance, route and path strategy packages', ['route-strategy', 'path-strategy', 'Faster runtime']],
  '2.14.0': ['New integrations for Node.js, Vue and Astro', ['Node.js', 'Vue', 'Astro']],
  '2.0.0': ['Dev HMR for translations', ['Edit a file', 'Save', 'See it live']],
  '1.73.0': ['Redesigned DevTools', ['Browse', 'Edit', 'Translate']],
  '1.65.0': ['Faster, smaller translation loading', ['Lighter payloads', 'Faster pages']],
  '1.58.0': ['Optimized translation loading', ['Per-page chunks', 'Less memory']],
}

function card({ eyebrow, title, subtitle, chips = [] }) {
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1280px;height:640px;background:${INK.bg};color:${INK.text};font-family:${FONT};padding:72px 80px;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}
body:before{content:'';position:absolute;inset:0;background:radial-gradient(620px 460px at 88% 110%,rgba(50,186,140,.22),transparent 70%)}
.brand{display:flex;align-items:center;gap:14px;font-size:24px;font-weight:600;color:${INK.dim};position:relative}
.brand svg{width:44px;height:44px}
h1{font-size:${title.length > 12 ? 74 : 112}px;letter-spacing:-.035em;line-height:1.05;font-weight:700}
p{font-size:32px;color:${INK.brand};margin-top:20px;letter-spacing:-.01em;max-width:1000px}
.main{position:relative}
.chips{display:flex;gap:12px;position:relative}
.chips span{border:1px solid ${INK.line};background:${INK.card};border-radius:999px;padding:10px 20px;font-size:22px;color:${INK.text}}
</style><div class="brand">${LOGO}${esc(eyebrow)}</div><div class="main"><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="chips">${chips.map((c) => `<span>${esc(c)}</span>`).join('')}</div>`
}

mkdirSync(new URL('diagrams/', PUBLIC), { recursive: true })
for (const [name, content] of Object.entries(diagrams)) writeFileSync(new URL(`diagrams/${name}.svg`, PUBLIC), content)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 640 } })
const shoot = async (file, html) => {
  await page.setContent(html)
  await page.screenshot({ path: fileURLToPath(new URL(file, PUBLIC)) })
}
for (const [version, [subtitle, chips]] of Object.entries(banners)) {
  await shoot(`${version}.png`, card({ eyebrow: 'Nuxt I18n Micro', title: `v${version}`, subtitle, chips }))
}
await shoot('og-image.png', card({ eyebrow: 'Docs', title: 'Nuxt I18n Micro', subtitle: 'Small, fast i18n for Nuxt', chips: ['Per-page JSON', 'Build-time routing', 'SEO included'] }))
await browser.close()
