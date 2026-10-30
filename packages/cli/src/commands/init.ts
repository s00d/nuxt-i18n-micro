import { spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { commandFailed, validationError } from '../errors'
import { stringifyJson, writeFilesAtomic } from '../fs'
import { ask, log } from '../log'

export interface InitArgs {
  cwd?: string
  name?: string
}

const SAFE_NAME = /^[\w.-]+$/

const LOCALES = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'ru', iso: 'ru-RU' },
]

const TRANSLATIONS: Record<string, unknown> = {
  en: { welcome: 'Welcome to Nuxt', description: 'This is a sample page with i18n support', navigation: { home: 'Home', about: 'About' } },
  de: {
    welcome: 'Willkommen bei Nuxt',
    description: 'Dies ist eine Beispielseite mit i18n-Unterstützung',
    navigation: { home: 'Startseite', about: 'Über uns' },
  },
  ru: { welcome: 'Добро пожаловать в Nuxt', description: 'Это пример страницы с поддержкой i18n', navigation: { home: 'Главная', about: 'О нас' } },
}

const page = (heading: string): string => `<template>
  <main>
    <h1>{{ $t('${heading}') }}</h1>
    <p>{{ $t('description') }}</p>
    <nav>
      <NuxtLink :to="$localeRoute('/')">{{ $t('navigation.home') }}</NuxtLink>
      <NuxtLink :to="$localeRoute('/about')">{{ $t('navigation.about') }}</NuxtLink>
    </nav>
    <i18n-switcher />
  </main>
</template>
`

const NUXT_CONFIG = `export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: ${JSON.stringify(LOCALES)},
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
  },
})
`

function runNuxi(name: string, cwd: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    // Windows ships npx as a .cmd, which needs a shell; the name was checked against SAFE_NAME.
    const child = spawn('npx', ['nuxi@latest', 'init', name, '--no-install', '--gitInit=false', '--packageManager=npm'], {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolvePromise() : reject(commandFailed(`nuxi init exited with code ${code}`))))
  })
}

function scaffold(projectPath: string): void {
  // Nuxt 4 templates keep sources in app/: pages next to it would be ignored.
  const srcDir = existsSync(join(projectPath, 'app')) ? join(projectPath, 'app') : projectPath
  const manifestPath = join(projectPath, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { dependencies?: Record<string, string> }
  manifest.dependencies = { ...manifest.dependencies, 'nuxt-i18n-micro': 'latest' }

  rmSync(join(srcDir, 'app.vue'), { force: true })
  writeFilesAtomic([
    [manifestPath, stringifyJson(manifest)],
    [join(srcDir, 'pages/index.vue'), page('welcome')],
    [join(srcDir, 'pages/about.vue'), page('navigation.about')],
    [join(projectPath, 'nuxt.config.ts'), NUXT_CONFIG],
    ...Object.entries(TRANSLATIONS).map(([code, value]): [string, string] => [join(projectPath, `locales/${code}.json`), stringifyJson(value)]),
  ])
}

async function resolveName(args: InitArgs, targetDir: string): Promise<string> {
  const name = args.name ?? (await ask('Project name:'))
  if (!name) throw validationError('Project name is required.', ['Pass --name <directory>.'])
  if (!SAFE_NAME.test(name)) throw validationError(`Invalid project name: ${name}`, ['Use letters, digits, dots, dashes and underscores.'])
  if (existsSync(join(targetDir, name))) throw validationError(`Directory ${name} already exists`, ['Choose another project name.'])
  return name
}

export default async function run(args: InitArgs): Promise<void> {
  const targetDir = resolve(args.cwd ?? '.')
  const name = await resolveName(args, targetDir)
  const projectPath = join(targetDir, name)

  try {
    await runNuxi(name, targetDir)
    scaffold(projectPath)
  } catch (error) {
    rmSync(projectPath, { recursive: true, force: true })
    throw error
  }

  log.success('Project initialized.')
  log.list('Next steps', [`cd ${name}`, 'npm install', 'npm run dev'])
}
