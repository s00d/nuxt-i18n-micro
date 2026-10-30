import { join } from 'node:path'
import { globSync } from 'glob'
import routes from './routeTranslations.json'

type RouteTranslation = {
  [key: string]: string
}

type Routes = {
  [lang: string]: RouteTranslation
}

// Type assertion for the imported routes
const typedRoutes = routes as Routes

const pagesDir = join(__dirname, '../pages/')
const pages: Record<string, Record<string, string>> = {}

const directoryListing = globSync(`${pagesDir}**/*.vue`)

directoryListing.forEach((path) => {
  const pageIdentifier: string = path
    .replace(pagesDir, '')
    .replace(/\.vue$/, '')
    .replace(/\/index$/, '')
    .replace(/\//g, '-')
    .replaceAll(/\[/g, '')
    .replaceAll(/\]/g, '')
  const partsBase: string = path
    .replace(pagesDir, '')
    .replace(/\.vue$/, '')
    .replace(/\[/g, ':')
    .replace(/\]/g, '()')

  if (pageIdentifier !== 'index' && !pageIdentifier.startsWith('[')) {
    pages[pageIdentifier] = {}

    const parts = partsBase.split('/')
    const newParts = parts.slice()

    for (const [lang, routeTranslations] of Object.entries(typedRoutes)) {
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (part && !part.match(/^\[/) && part !== 'index') {
          if (routeTranslations[part]) {
            newParts[i] = routeTranslations[part]
          }
        } else {
          const part = parts[i]
          if (part) {
            newParts[i] = part // .replace(/^_$/, '*').replace(/^_/, ':');
          }
        }
      }
      pages[pageIdentifier][lang] = newParts.join('/')
      pages[pageIdentifier][lang] = `/${pages[pageIdentifier][lang].replace(/\/index$/, '')}`
    }
  }
})
// console.log('pages :>> ', pages);

export default pages
