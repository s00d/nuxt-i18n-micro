import type { Page } from '@playwright/test'
import { expect } from 'untestutils/vitest'

type Goto = (path: string, options?: Record<string, unknown>) => Promise<unknown>

/** The activity slug tree of `basic` (and `basic-prefix`): localized segments per locale, under a URL prefix. */
export interface ActivitySlugs {
  /** URL prefix of the locale: '' (default under pec), '/en', '/de'. */
  prefix: string
  bookSkiing: string
  bookHiking: string
  change: string
  /** Child path of the skiing page under `change`. */
  changeSkiing: string
  text: string
}

export const enActivity = (prefix: string): ActivitySlugs => ({
  prefix,
  bookSkiing: '/activity/book-activity/skiing',
  bookHiking: '/activity/book-activity/hiking',
  change: '/change-activity',
  changeSkiing: '/book-activity/skiing',
  text: 'Welcome to the page!',
})

export const deActivity = (prefix: string): ActivitySlugs => ({
  prefix,
  bookSkiing: '/activity/aktivitaet-buchen/ski-fahren',
  bookHiking: '/activity/aktivitaet-buchen/wandern',
  change: '/change-buchen',
  changeSkiing: '/aktivitaet-buchen/ski-fahren',
  text: 'Willkommen auf der Seite!',
})

/** Walks the activity tree: every href, then each child link from a fresh /activity. was: locale-slug › Test Locale Path (+ de, + basic-prefix en) */
export async function walkActivity(page: Page, goto: Goto, s: ActivitySlugs) {
  const root = `${s.prefix}/activity`
  const change = `${s.prefix}${s.change}`
  await goto(root, { waitUntil: 'hydration' })
  await expect(page).toHaveURL(root)
  await expect(page.locator('h1')).toHaveText('Activity Parent Page')
  await expect(page.locator('#activity')).toHaveAttribute('href', root)
  await expect(page.locator('#activity-skiing')).toHaveAttribute('href', `${root}/skiing`)
  await expect(page.locator('#activity-hiking')).toHaveAttribute('href', `${root}/hiking`)
  await expect(page.locator('#activity-skiing-locale')).toHaveAttribute('href', `${s.prefix}${s.bookSkiing}`)
  await expect(page.locator('#activity-hiking-locale')).toHaveAttribute('href', `${s.prefix}${s.bookHiking}`)
  await expect(page.locator('#activity-locale')).toHaveAttribute('href', change)

  const children: [string, string, string][] = [
    ['#activity-skiing', `${root}/skiing`, 'Skiing Subpage'],
    ['#activity-hiking', `${root}/hiking`, 'Hiking Subpage'],
    ['#activity-skiing-locale', `${s.prefix}${s.bookSkiing}`, 'Skiing Locale Subpage'],
    ['#activity-hiking-locale', `${s.prefix}${s.bookHiking}`, 'Hiking Locale Subpage'],
  ]
  for (const [link, url, title] of children) {
    await goto(root, { waitUntil: 'hydration' })
    await page.click(link)
    await expect(page).toHaveURL(url)
    await expect(page.locator('#title')).toHaveText(title)
    await expect(page.locator('#text')).toHaveText(s.text)
  }

  await goto(root, { waitUntil: 'hydration' })
  await page.click('#activity-locale')
  await expect(page).toHaveURL(change)
  await expect(page.locator('#activity-locale-skiing')).toHaveAttribute('href', `${change}${s.changeSkiing}`)
  await expect(page.locator('#activity-locale-hiking')).toHaveAttribute('href', `${change}/hiking`)
  await page.click('#activity-locale-hiking')
  await expect(page).toHaveURL(`${change}/hiking`)
  await page.click('#activity-locale')
  await expect(page).toHaveURL(change)
  await page.click('#activity-locale-skiing')
  await expect(page).toHaveURL(`${change}${s.changeSkiing}`)
}
