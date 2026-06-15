interface ScrollPreservePointer {
  root: string
  tag: string
  index: number
  clientY: number
  offsetY: number
  scrollY: number
}

const POINTER_STATE_KEY = 'playground:scroll-preserve-pointer'

let scrollBehaviorPatched = false

function applyPointerScroll(pointer: ScrollPreservePointer): void {
  const root = document.querySelector(pointer.root)
  const el = root?.querySelectorAll(pointer.tag)[pointer.index]
  if (!el) {
    return
  }

  const top = window.scrollY + el.getBoundingClientRect().top + pointer.offsetY - pointer.clientY
  window.scrollTo({ top, left: 0, behavior: 'instant' })
}

function scheduleRefine(pointer: ScrollPreservePointer): void {
  requestAnimationFrame(() => {
    applyPointerScroll(pointer)
    requestAnimationFrame(() => {
      applyPointerScroll(pointer)
      requestAnimationFrame(() => applyPointerScroll(pointer))
    })
  })
}

function ensureScrollBehavior(pointerState: Ref<ScrollPreservePointer | null>): void {
  if (scrollBehaviorPatched || typeof window === 'undefined') {
    return
  }

  scrollBehaviorPatched = true
  const router = useRouter()
  const previousScrollBehavior = router.options.scrollBehavior

  router.options.scrollBehavior = (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    }

    const pointer = pointerState.value
    if (pointer) {
      scheduleRefine(pointer)
      return { top: pointer.scrollY, left: 0, behavior: 'instant' }
    }

    if (previousScrollBehavior) {
      return previousScrollBehavior(to, from, savedPosition)
    }

    if (to.hash) {
      return { el: to.hash, behavior: 'instant' }
    }

    return { top: 0, left: 0 }
  }
}

function capturePointer(event: MouseEvent, rootSelector: string): ScrollPreservePointer | null {
  const target = event.currentTarget
  if (!(target instanceof HTMLButtonElement)) {
    return null
  }

  const root = target.closest(rootSelector)
  if (!root) {
    return null
  }

  const buttons = [...root.querySelectorAll('button')]
  const index = buttons.indexOf(target)
  if (index < 0) {
    return null
  }

  const rect = target.getBoundingClientRect()
  return {
    root: rootSelector,
    tag: 'button',
    index,
    clientY: event.clientY,
    offsetY: event.clientY - rect.top,
    scrollY: window.scrollY,
  }
}

async function waitForPageSettled(): Promise<void> {
  const nuxtApp = useNuxtApp()
  await nextTick()

  await new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) {
        return
      }
      settled = true
      resolve()
    }

    const timeout = window.setTimeout(finish, 100)
    const stop = nuxtApp.hook('page:finish', () => {
      window.clearTimeout(timeout)
      stop()
      finish()
    })
  })

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function restoreUntilStable(pointer: ScrollPreservePointer): Promise<void> {
  applyPointerScroll(pointer)
  scheduleRefine(pointer)

  return new Promise((resolve) => {
    let timer: number | undefined

    const settle = () => {
      applyPointerScroll(pointer)
      observer.disconnect()
      if (timer) {
        window.clearTimeout(timer)
      }
      resolve()
    }

    const onResize = () => {
      applyPointerScroll(pointer)
      if (timer) {
        window.clearTimeout(timer)
      }
      timer = window.setTimeout(settle, 100)
    }

    const observer = new ResizeObserver(onResize)
    observer.observe(document.documentElement)

    timer = window.setTimeout(settle, 500)
  })
}

/**
 * Demo for discussion #228 — save scroll, $switchLocale, restore after layout.
 * Pair with definePageMeta({ scrollToTop: false }) on the page.
 */
export function useSwitchLocalePreserveScroll(rootSelector = '#scroll-test-switcher') {
  const { $switchLocale } = useI18n()
  const pointerState = useState<ScrollPreservePointer | null>(POINTER_STATE_KEY, () => null)

  ensureScrollBehavior(pointerState)

  async function switchLocale(code: string, event?: MouseEvent) {
    const pointer = event ? capturePointer(event, rootSelector) : null
    const scrollY = window.scrollY

    pointerState.value = pointer

    try {
      await $switchLocale(code)
      await waitForPageSettled()

      if (pointer) {
        await restoreUntilStable(pointer)
      } else {
        window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' })
      }
    } finally {
      pointerState.value = null
    }
  }

  return { switchLocale }
}
