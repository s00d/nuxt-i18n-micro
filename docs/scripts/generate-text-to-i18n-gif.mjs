import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../../.tmp/text-to-i18n-gif/frames')
const GIF_OUT = path.join(__dirname, '../public/text-to-i18n.gif')
const BANNER_PATH = path.join(__dirname, '../public/1.1.0.png')
const WIDTH = 1600
const HEIGHT = 900
const FPS = 10
const INTRO_SECONDS = 2
const INTRO_FRAMES = FPS * INTRO_SECONDS

const beforeCode = `<template>
  <div>
    <h1>Привет, мир! Добро пожаловать!</h1>
    <h2>Введение в тестовую страницу</h2>
    <p>Это тестовая страница для демонстрации Vue.</p>
    <button>Начать работу</button>
  </div>
</template>`

const afterCode = `<template>
  <div>
    <h1>{{ $t('pages.demo.privet-mir-dobro') }}</h1>
    <h2>{{ $t('pages.demo.vvedenie') }}</h2>
    <p>{{ $t('pages.demo.opisanie') }}</p>
    <button>{{ $t('pages.demo.nachat') }}</button>
  </div>
</template>`

const jsonCode = `{
  "pages": {
    "demo": {
      "privet-mir-dobro": "Привет, мир! Добро пожаловать!",
      "vvedenie": "Введение в тестовую страницу",
      "opisanie": "Это тестовая страница для демонстрации Vue.",
      "nachat": "Начать работу"
    }
  }
}`

const fullCommand = 'i18n-micro text-to-i18n --verbose --path ./pages/demo.vue'

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function plain(text) {
  return escapeHtml(text)
}

function span(cls, text) {
  return `<span class="${cls}">${escapeHtml(text)}</span>`
}

function highlightVueLine(line, mode) {
  if (!line) return ' '

  let out = ''
  let index = 0

  const indent = line.match(/^(\s*)/)?.[1] ?? ''
  if (indent) {
    out += plain(indent)
    index = indent.length
  }

  while (index < line.length) {
    const rest = line.slice(index)

    if (mode === 'after') {
      const i18nMatch = rest.match(/^\{\{\s*\$t\('([^']+)'\)\s*\}\}/)
      if (i18nMatch) {
        out += span('hl-i18n', i18nMatch[0])
        index += i18nMatch[0].length
        continue
      }
    }

    if (rest.startsWith('class="')) {
      const end = rest.indexOf('"', 7)
      if (end !== -1) {
        const token = rest.slice(0, end + 1)
        out += span('hl-attr', token)
        index += token.length
        continue
      }
    }

    const tagMatch = rest.match(/^<\/?[\w-]+/)
    if (tagMatch) {
      out += span('hl-tag', tagMatch[0])
      index += tagMatch[0].length
      continue
    }

    if (mode === 'before' && line[index] === '>') {
      const nextTag = line.indexOf('<', index + 1)
      if (nextTag === -1) {
        out += plain(line.slice(index))
        break
      }

      out += plain('>')
      const text = line.slice(index + 1, nextTag)
      out += text.trim() ? span('hl-text', text) : plain(text)
      index = nextTag
      continue
    }

    out += plain(line[index])
    index += 1
  }

  return out
}

function highlightJsonLine(line) {
  if (!line) return ' '

  let out = ''
  let rest = line

  const indent = line.match(/^(\s*)/)?.[1] ?? ''
  if (indent) {
    out += plain(indent)
    rest = line.slice(indent.length)
  }

  const keyMatch = rest.match(/^"([^"]+)":/)
  if (keyMatch) {
    out += span('hl-key', keyMatch[0])
    rest = rest.slice(keyMatch[0].length)
  }

  const stringMatch = rest.match(/^ "([^"]*)"/)
  if (stringMatch) {
    out += plain(' ')
    out += span('hl-string', `"${stringMatch[1]}"`)
    rest = rest.slice(stringMatch[0].length)
  }

  out += plain(rest)
  return out
}

function renderCodeBlock(code, mode) {
  const lines = code.split('\n')
  return lines.map((line, index) => (
    `<div class="line"><span class="ln">${String(index + 1).padStart(2, ' ')}</span><span class="code">${mode === 'json' ? highlightJsonLine(line) : highlightVueLine(line, mode)}</span></div>`
  )).join('')
}

function highlightVue(code, mode) {
  return renderCodeBlock(code, mode)
}

function highlightJson(code) {
  return renderCodeBlock(code, 'json')
}

function renderFileTree({ codeMode, showJson }) {
  const isBefore = codeMode === 'before'
  const localeUpdated = !isBefore
  const demoActive = !showJson
  const jsonActive = showJson

  const demoClass = [
    'tree-file',
    demoActive ? 'active' : '',
    isBefore ? 'before-target' : 'after-target',
  ].filter(Boolean).join(' ')

  const jsonClass = [
    'tree-file',
    jsonActive ? 'active' : '',
    localeUpdated ? 'after-target' : 'before-target',
  ].filter(Boolean).join(' ')

  const demoStatus = isBefore
    ? '<span class="tree-status warn">hardcoded</span>'
    : '<span class="tree-status ok">$t keys</span>'

  const jsonStatus = isBefore
    ? '<span class="tree-status muted">{ }</span>'
    : '<span class="tree-status ok">+4 keys</span>'

  return `
    <aside class="sidebar">
      <div class="sidebar-head">Explorer</div>
      <ul class="tree">
        <li class="tree-group">
          <div class="tree-folder"><span class="chev">▾</span><span class="folder">locales</span></div>
          <ul class="tree-children">
            <li class="${jsonClass}">
              <span class="file-icon json">{}</span>
              <span class="file-name">en.json</span>
              ${jsonStatus}
            </li>
          </ul>
        </li>
        <li class="tree-group">
          <div class="tree-folder"><span class="chev">▾</span><span class="folder">pages</span></div>
          <ul class="tree-children">
            <li class="${demoClass}">
              <span class="file-icon vue">V</span>
              <span class="file-name">demo.vue</span>
              ${demoStatus}
            </li>
          </ul>
        </li>
      </ul>
      <div class="sidebar-note">${isBefore ? 'Before: text in Vue file' : showJson ? 'After: keys in locales/en.json' : 'After: Vue uses $t(...)'}</div>
    </aside>
  `
}

function renderIntroHtml(bannerDataUrl, progress) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: radial-gradient(1200px 600px at 20% -10%, rgba(50,186,140,.18), transparent 55%),
                radial-gradient(900px 500px at 100% 0%, rgba(56,189,248,.12), transparent 50%),
                linear-gradient(180deg, #0b1220 0%, #0f172a 100%);
    overflow: hidden;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
  }
  .intro {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    padding: 36px 40px 48px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .intro-banner-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(148,163,184,.14);
    box-shadow: 0 18px 50px rgba(2,6,23,.35);
    background: rgba(15,23,42,.55);
  }
  .intro-banner {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .intro-progress {
    height: 8px;
    border-radius: 999px;
    background: rgba(148,163,184,.16);
    overflow: hidden;
    border: 1px solid rgba(148,163,184,.12);
  }
  .intro-progress > span {
    display: block;
    height: 100%;
    width: ${Math.round(progress)}%;
    background: linear-gradient(90deg, #32ba8c, #38bdf8);
    box-shadow: 0 0 18px rgba(50,186,140,.45);
    border-radius: 999px;
  }
</style>
</head>
<body>
  <div class="intro">
    <div class="intro-banner-wrap">
      <img src="${bannerDataUrl}" alt="v1.1.0 CLI text-to-i18n" class="intro-banner" />
    </div>
    <div class="intro-progress"><span></span></div>
  </div>
</body>
</html>`
}

function renderHtml(state) {
  const {
    codeMode = 'before',
    showJson = false,
    command = '',
    terminalLines = [],
    progress = 0,
    badge = 'BEFORE',
  } = state

  const vueCode = codeMode === 'after' ? afterCode : beforeCode
  const vueBody = highlightVue(vueCode, codeMode)
  const jsonBody = highlightJson(jsonCode)
  const codeFontSize = showJson ? 20 : 22
  const panelBody = showJson ? jsonBody : vueBody
  const panelTitle = showJson ? 'locales/en.json' : 'pages/demo.vue'
  const fileTree = renderFileTree({ codeMode, showJson })

  const termLines = terminalLines.map((line) => {
    const cls = line.type === 'success' ? 'ok' : line.type === 'cmd' ? 'cmd' : 'info'
    return `<div class="term-line ${cls}">${escapeHtml(line.text)}</div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: radial-gradient(1200px 600px at 20% -10%, rgba(50,186,140,.18), transparent 55%),
                radial-gradient(900px 500px at 100% 0%, rgba(56,189,248,.12), transparent 50%),
                linear-gradient(180deg, #0b1220 0%, #0f172a 100%);
    color: #e2e8f0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
    overflow: hidden;
  }
  .shell {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    padding: 36px 40px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 22px;
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 700;
    font-size: 22px;
    letter-spacing: .02em;
  }
  .brand-dot {
    width: 14px; height: 14px; border-radius: 999px;
    background: linear-gradient(135deg, #5fe0ae, #32ba8c);
    box-shadow: 0 0 18px rgba(50,186,140,.55);
  }
  .badge {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #34d399;
    background: rgba(16,185,129,.12);
    border: 1px solid rgba(52,211,153,.25);
    padding: 8px 14px;
    border-radius: 999px;
  }
  .workspace {
    display: grid;
    grid-template-columns: 290px minmax(0, 1fr);
    gap: 18px;
    min-height: 0;
  }
  .sidebar {
    background: rgba(15,23,42,.82);
    border: 1px solid rgba(148,163,184,.14);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 18px 50px rgba(2,6,23,.35);
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .sidebar-head {
    padding: 14px 16px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #94a3b8;
    border-bottom: 1px solid rgba(148,163,184,.12);
    background: rgba(2,6,23,.55);
  }
  .tree {
    list-style: none;
    margin: 0;
    padding: 14px 10px;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 16px;
    line-height: 1.45;
  }
  .tree-group { margin-bottom: 8px; }
  .tree-children {
    list-style: none;
    margin: 6px 0 0;
    padding: 0 0 0 18px;
  }
  .tree-folder {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #cbd5e1;
    padding: 4px 8px;
    border-radius: 8px;
  }
  .chev { color: #64748b; font-size: 14px; }
  .folder { color: #cbd5e1; font-weight: 600; }
  .tree-file {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 4px;
    align-items: center;
    padding: 10px 10px;
    border-radius: 10px;
    border: 1px solid transparent;
    color: #cbd5e1;
    margin-top: 4px;
  }
  .tree-file.active {
    background: rgba(50,186,140,.12);
    border-color: rgba(52,211,153,.28);
    box-shadow: inset 0 0 0 1px rgba(50,186,140,.08);
  }
  .tree-file.before-target.active {
    background: rgba(250,204,21,.08);
    border-color: rgba(250,204,21,.22);
  }
  .tree-file.after-target:not(.active) {
    border-color: rgba(52,211,153,.12);
  }
  .file-icon {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    grid-row: span 2;
  }
  .file-icon.vue { background: rgba(52,211,153,.18); color: #6ee7b7; }
  .file-icon.json { background: rgba(56,189,248,.18); color: #7dd3fc; }
  .file-name { font-size: 16px; color: #e2e8f0; }
  .tree-status {
    grid-column: 2;
    font-size: 13px;
    line-height: 1.2;
  }
  .tree-status.warn { color: #fde68a; }
  .tree-status.ok { color: #6ee7b7; }
  .tree-status.muted { color: #64748b; }
  .sidebar-note {
    margin-top: auto;
    padding: 14px 16px 16px;
    font-size: 14px;
    line-height: 1.45;
    color: #94a3b8;
    border-top: 1px solid rgba(148,163,184,.12);
    background: rgba(2,6,23,.35);
  }
  .panel {
    background: rgba(15,23,42,.82);
    border: 1px solid rgba(148,163,184,.14);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 18px 50px rgba(2,6,23,.35);
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .panel-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: rgba(2,6,23,.55);
    border-bottom: 1px solid rgba(148,163,184,.12);
    font-size: 17px;
    color: #94a3b8;
  }
  .dot { width: 12px; height: 12px; border-radius: 999px; }
  .dot.r { background: #fb7185; }
  .dot.y { background: #fbbf24; }
  .dot.g { background: #34d399; }
  .panel-body {
    padding: 20px 0 24px;
    overflow: hidden;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: ${codeFontSize}px;
    line-height: 1.7;
  }
  .line {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    padding: 0 22px;
    min-height: 1.75em;
  }
  .ln {
    width: 34px;
    flex: 0 0 34px;
    color: #64748b;
    text-align: right;
    user-select: none;
    font-size: ${Math.max(codeFontSize - 2, 18)}px;
  }
  .code {
    flex: 1;
    min-width: 0;
    white-space: pre;
    overflow: hidden;
    tab-size: 2;
  }
  .hl-tag { color: #7dd3fc; }
  .hl-attr { color: #c4b5fd; }
  .hl-text { color: #fde68a; background: rgba(250,204,21,.12); border-radius: 4px; padding: 0 3px; }
  .hl-i18n { color: #6ee7b7; background: rgba(16,185,129,.16); border-radius: 4px; padding: 0 3px; }
  .hl-key { color: #7dd3fc; }
  .hl-string { color: #fde68a; }
  .terminal {
    background: rgba(2,6,23,.78);
    border: 1px solid rgba(148,163,184,.14);
    border-radius: 16px;
    padding: 20px 22px;
    font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 20px;
    min-height: 148px;
  }
  .term-line { margin: 6px 0; white-space: pre-wrap; line-height: 1.5; }
  .term-line.cmd { color: #e2e8f0; }
  .term-line.info { color: #93c5fd; }
  .term-line.ok { color: #6ee7b7; }
  .cursor {
    display: inline-block;
    width: 10px;
    height: 22px;
    background: #34d399;
    margin-left: 3px;
    vertical-align: -3px;
    animation: blink 1s step-end infinite;
  }
  @keyframes blink { 50% { opacity: 0; } }
  .progress {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 3px;
    background: rgba(148,163,184,.12);
  }
  .progress > span {
    display: block;
    height: 100%;
    width: ${Math.round(progress * 100)}%;
    background: linear-gradient(90deg, #32ba8c, #38bdf8);
    box-shadow: 0 0 16px rgba(50,186,140,.45);
  }
</style>
</head>
<body>
  <div class="shell">
    <div class="topbar">
      <div class="brand"><span class="brand-dot"></span> Nuxt I18n Micro · text-to-i18n</div>
      <div class="badge">${badge}</div>
    </div>
    <div class="workspace">
      ${fileTree}
      <div class="panel">
        <div class="panel-head"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span>${panelTitle}</span></div>
        <div class="panel-body">${panelBody}</div>
        <div class="progress"><span></span></div>
      </div>
    </div>
    <div class="terminal">
      <div class="term-line cmd">$ ${escapeHtml(command)}${command.length < fullCommand.length ? '<span class="cursor"></span>' : ''}</div>
      ${termLines}
    </div>
  </div>
</body>
</html>`
}

function buildTimeline() {
  const frames = []
  const pushHold = (count, state) => {
    for (let i = 0; i < count; i++) frames.push({ ...state })
  }

  pushHold(10, { codeMode: 'before', badge: 'BEFORE', command: '', terminalLines: [] })

  for (let i = 1; i <= fullCommand.length; i++) {
    frames.push({
      codeMode: 'before',
      badge: 'RUN',
      command: fullCommand.slice(0, i),
      terminalLines: [],
      progress: i / fullCommand.length * 0.35,
    })
  }

  const runLines = [
    { type: 'info', text: 'ℹ Found 1 files to process.' },
    { type: 'info', text: 'ℹ Found 4 new translations.' },
  ]
  for (let i = 0; i <= runLines.length; i++) {
    frames.push({
      codeMode: 'before',
      badge: 'RUN',
      command: fullCommand,
      terminalLines: runLines.slice(0, i),
      progress: 0.55,
    })
  }

  frames.push({
    codeMode: 'before',
    badge: 'RUN',
    command: fullCommand,
    terminalLines: [...runLines, { type: 'success', text: '✔ Updated translation file.' }],
    progress: 0.75,
  })

  for (let i = 0; i < 8; i++) {
    frames.push({
      codeMode: i < 4 ? 'before' : 'after',
      badge: 'AFTER',
      command: fullCommand,
      terminalLines: [...runLines, { type: 'success', text: '✔ Updated translation file.' }],
      progress: 0.85,
    })
  }

  pushHold(12, {
    codeMode: 'after',
    badge: 'AFTER',
    command: fullCommand,
    terminalLines: [...runLines, { type: 'success', text: '✔ Updated translation file.' }],
    progress: 1,
  })

  for (let i = 0; i < 10; i++) {
    frames.push({
      codeMode: 'after',
      showJson: i > 2,
      badge: 'LOCALES',
      command: fullCommand,
      terminalLines: [...runLines, { type: 'success', text: '✔ Updated translation file.' }],
      progress: 1,
    })
  }

  pushHold(8, {
    codeMode: 'after',
    showJson: true,
    badge: 'LOCALES',
    command: fullCommand,
    terminalLines: [...runLines, { type: 'success', text: '✔ Updated translation file.' }],
    progress: 1,
  })

  return frames
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  const bannerDataUrl = `data:image/png;base64,${fs.readFileSync(BANNER_PATH).toString('base64')}`

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } })

  for (let i = 0; i < INTRO_FRAMES; i++) {
    const progress = ((i + 1) / INTRO_FRAMES) * 100
    await page.setContent(renderIntroHtml(bannerDataUrl, progress), { waitUntil: 'domcontentloaded' })
    const file = path.join(OUT, `frame_${String(i).padStart(4, '0')}.png`)
    await page.screenshot({ path: file, type: 'png' })
  }

  const timeline = buildTimeline()
  for (let i = 0; i < timeline.length; i++) {
    await page.setContent(renderHtml(timeline[i]), { waitUntil: 'domcontentloaded' })
    const file = path.join(OUT, `frame_${String(i + INTRO_FRAMES).padStart(4, '0')}.png`)
    await page.screenshot({ path: file, type: 'png' })
  }

  await browser.close()

  execFileSync('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(OUT, 'frame_%04d.png'),
    '-vf', 'fps=10,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3',
    GIF_OUT,
  ], { stdio: 'inherit' })

  const stats = fs.statSync(GIF_OUT)
  console.log(`Generated ${INTRO_FRAMES + timeline.length} frames`)
  console.log(`Saved ${GIF_OUT} (${Math.round(stats.size / 1024)} KB)`)
}

main()
