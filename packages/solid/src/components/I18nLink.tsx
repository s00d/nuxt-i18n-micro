/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { splitProps, createMemo, type Accessor, type Component, type JSX } from 'solid-js'
import { useI18nRouter, useI18nContext } from '../injection'
import type { I18nRoutingStrategy } from '../router/types'

interface I18nLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string | { path?: string }
  localeRoute?: (to: string | { path?: string }, locale?: string) => string | { path?: string }
  activeStyle?: JSX.CSSProperties
}

export const I18nLink: Component<I18nLinkProps> = (props): JSX.Element => {
  const router = useI18nRouter()
  const i18n = useI18nContext()
  // Разделяем пропсы: явно выделяем style, чтобы объединить его с activeStyle
  const [local, others] = splitProps(props, ['to', 'localeRoute', 'activeStyle', 'style', 'children'])

  // 1. Получаем accessor для текущего пути из роутера
  const extendedRouter = router as I18nRoutingStrategy & { getCurrentPathAccessor?: Accessor<string> }
  const pathnameAccessor = extendedRouter?.getCurrentPathAccessor

  // 2. Вычисление целевого пути (href) - реактивно отслеживает изменения локали
  const targetPath = createMemo(() => {
    // Используем реактивный accessor для отслеживания изменений локали
    const currentLocale = i18n.localeAccessor()
    let result: string
    if (local.localeRoute) {
      const res = local.localeRoute(local.to, currentLocale)
      result = typeof res === 'string' ? res : res?.path || '/'
    }
    else if (router?.resolvePath) {
      const res = router.resolvePath(local.to, currentLocale)
      result = typeof res === 'string' ? res : (res?.path || '/')
    }
    else if (typeof local.to === 'string') {
      result = local.to
    }
    else {
      result = (local.to as { path?: string })?.path || '/'
    }
    return result
  })

  // 3. Проверка на внешнюю ссылку
  const isExternal = createMemo(() => {
    if (typeof local.to === 'string') {
      return /^(?:https?:\/\/|\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})|tel:|mailto:/.test(local.to)
    }
    return false
  })

  // 4. Вычисление активного состояния
  // Важно: вызываем pathnameAccessor() внутри createMemo для правильного отслеживания изменений
  const isActive = createMemo(() => {
    if (isExternal()) {
      return false
    }

    // Получаем текущий путь - вызываем accessor внутри createMemo для реактивности
    const current = pathnameAccessor
      ? pathnameAccessor() // Вызов accessor внутри createMemo отслеживает изменения
      : (router ? router.getCurrentPath() : (typeof window !== 'undefined' ? window.location.pathname : '/'))
    const target = targetPath()

    // Нормализация для сравнения (убираем слэш в конце, если это не корень)
    const normCurrent = current === '/' ? '/' : current.replace(/\/$/, '')
    const normTarget = target === '/' ? '/' : target.replace(/\/$/, '')

    return normCurrent === normTarget
  })

  // 5. Объединение стилей - используем isActive напрямую для реактивности
  const mergedStyle = createMemo(() => {
    const baseStyle = local.style || {}
    // Вызываем isActive() внутри createMemo для отслеживания изменений
    const active = isActive()
    const activeStyle = active ? (local.activeStyle || {}) : {}

    // SolidJS умеет работать с объектами стилей корректно при слиянии
    return {
      ...(typeof baseStyle === 'object' ? baseStyle : {}),
      ...(typeof activeStyle === 'object' ? activeStyle : {}),
    } as JSX.CSSProperties
  })

  // Используем linkComponent из роутера, если доступен
  const LinkComponent = router?.linkComponent

  if (isExternal()) {
    return (
      // @ts-expect-error - Type conflict with Vue JSX
      <a
        href={typeof local.to === 'string' ? local.to : ''}
        target="_blank"
        rel="noopener noreferrer"
        style={mergedStyle()}
        {...(others as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {local.children}
      </a>
    ) as unknown as JSX.Element
  }

  // Если есть linkComponent из роутера (например, A из @solidjs/router), используем его
  if (LinkComponent) {
    return (
      // @ts-expect-error - Type conflict with router component types
      <LinkComponent
        href={targetPath()}
        style={mergedStyle()}
        {...(others as unknown as Record<string, unknown>)}
      >
        {local.children}
      </LinkComponent>
    ) as unknown as JSX.Element
  }

  // Fallback на нативный <a> с onClick обработчиком
  return (
    // @ts-expect-error - Type conflict with Vue JSX
    <a
      href={targetPath()}
      style={mergedStyle()}
      {...(others as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
      onClick={(e: MouseEvent) => {
        if (router && !isExternal()) {
          e.preventDefault()
          router.push({ path: targetPath() })
        }
      }}
    >
      {local.children}
    </a>
  ) as unknown as JSX.Element
}
