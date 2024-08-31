import { browser } from 'k6/browser'
import { sleep, check } from 'k6'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js'

export const options = {
  scenarios: {
    openLinks: {
      executor: 'constant-vus',
      vus: 1,
      duration: '10s',
      exec: 'openLinksScenario',
      tags: { scenario: 'openLinks' },
      // Опция browser указывается только для первого сценария
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
    openRoot: {
      executor: 'constant-vus',
      vus: 2,
      duration: '60s',
      exec: 'openRootPage',
      startTime: '12s',
      tags: { scenario: 'openRoot' },
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
    openRootRU: {
      executor: 'constant-vus',
      vus: 2,
      duration: '60s',
      exec: 'openRootRUPage',
      tags: { scenario: 'openRootRU' },
      startTime: '12s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
    openRootDE: {
      executor: 'constant-vus',
      vus: 2,
      duration: '60s',
      exec: 'openRootDEPage',
      tags: { scenario: 'openRootDE' },
      startTime: '12s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
    openPage: {
      executor: 'constant-vus',
      vus: 2,
      duration: '60s',
      exec: 'openPagePage',
      tags: { scenario: 'openPage' },
      startTime: '12s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
    openPageRU: {
      executor: 'constant-vus',
      vus: 2,
      duration: '60s',
      exec: 'openPageRUPage',
      tags: { scenario: 'openPageRU' },
      startTime: '12s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
    openPageDE: {
      executor: 'constant-vus',
      vus: 2,
      duration: '60s',
      exec: 'openPageDEPage',
      tags: { scenario: 'openPageDE' },
      startTime: '12s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
}

export async function openLinksScenario() {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://127.0.0.1:10000/')
  await page.goto('http://127.0.0.1:10000/ru')
  await page.goto('http://127.0.0.1:10000/de')
  await page.goto('http://127.0.0.1:10000/page')
  await page.goto('http://127.0.0.1:10000/ru/page')
  await page.goto('http://127.0.0.1:10000/de/page')

  sleep(3)
  await page.close()
  await context.close()
}

export async function openRootPage() {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://127.0.0.1:10000/')

  check(page, {
    'status is 200': r => r.status === 200,
  })

  sleep(1)
  await page.close()
  await context.close()
}

export async function openRootRUPage() {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://127.0.0.1:10000/ru')

  check(page, {
    'status is 200': r => r.status === 200,
  })

  sleep(1)
  await page.close()
  await context.close()
}

export async function openRootDEPage() {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://127.0.0.1:10000/de')

  check(page, {
    'status is 200': r => r.status === 200,
  })

  sleep(1)
  await page.close()
  await context.close()
}

export async function openPagePage() {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://127.0.0.1:10000/page')

  check(page, {
    'status is 200': r => r.status === 200,
  })

  sleep(1)
  await page.close()
  await context.close()
}

export async function openPageRUPage() {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://127.0.0.1:10000/ru/page')

  check(page, {
    'status is 200': r => r.status === 200,
  })

  sleep(1)
  await page.close()
  await context.close()
}

export async function openPageDEPage() {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://127.0.0.1:10000/de/page')

  check(page, {
    'status is 200': r => r.status === 200,
  })

  sleep(1)
  await page.close()
  await context.close()
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  }
}
