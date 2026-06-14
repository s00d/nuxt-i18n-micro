import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, '../public')
const LOGO = path.join(PUBLIC, 'logo.svg')
const OUT = path.join(PUBLIC, 'og-image.png')

const WIDTH = 1200
const HEIGHT = 630

const background = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#123638"/>
      <stop offset="100%" stop-color="#1a5051"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <text x="620" y="300" fill="#ffffff" font-family="system-ui, sans-serif" font-size="64" font-weight="700">Nuxt I18n Micro</text>
  <text x="620" y="370" fill="#9ae6b4" font-family="system-ui, sans-serif" font-size="30">Fast, simple, lightweight i18n for Nuxt</text>
</svg>
`)

const logo = fs.readFileSync(LOGO)
const logoSize = 320

await sharp(background)
  .composite([
    {
      input: await sharp(logo).resize(logoSize, logoSize).png().toBuffer(),
      left: 180,
      top: Math.round((HEIGHT - logoSize) / 2),
    },
  ])
  .png()
  .toFile(OUT)

console.log(`wrote ${OUT}`)
