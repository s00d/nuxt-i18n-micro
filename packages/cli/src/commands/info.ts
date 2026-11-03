import { version } from '../../package.json'
import { log } from '../log'
import { loadProjectConfig } from '../nuxt'

export interface InfoArgs {
  cwd?: string
  json?: boolean
}

export default async function run(args: InfoArgs): Promise<void> {
  const config = await loadProjectConfig(args.cwd ?? '.')
  const locales = config.locales.map((locale) => locale.code)
  const { rootDir, srcDir, defaultLocale, translationDir, translationDirs, disablePageLocales } = config

  if (args.json) {
    log.json({ version, rootDir, srcDir, defaultLocale, locales, translationDir, translationDirs, disablePageLocales })
    return
  }
  log.rows([
    ['CLI', version],
    ['Root', rootDir],
    ['Default locale', defaultLocale],
    ['Locales', locales.join(', ')],
    ['Translation directory', translationDir],
    ['Page locales', disablePageLocales ? 'disabled' : 'enabled'],
  ])
  log.list('Read from, last wins', translationDirs)
}
