import { defineComponent, ref, computed, h, onMounted, onUnmounted, nextTick, type PropType, type CSSProperties, type VNode } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../use-i18n'
import type { Locale } from '@i18n-micro/types'

export const I18nSwitcher = defineComponent({
  name: 'I18nSwitcher',
  props: {
    customLabels: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    customWrapperStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    customButtonStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    customDropdownStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    customItemStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    customLinkStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    customActiveLinkStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    customDisabledLinkStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    customIconStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    const { localeRoute, switchLocale, getLocales, locale, getLocaleName } = useI18n()
    let router: ReturnType<typeof useRouter> | undefined
    try {
      router = useRouter()
    }
    catch {
      // Router not available
    }

    // Используем computed для реактивности
    const locales = computed(() => getLocales() || [])
    const currentLocale = computed(() => locale.value)
    const currentLocaleName = computed(() => getLocaleName())
    const dropdownOpen = ref(false)
    const wrapperRef = ref<HTMLElement | null>(null)

    const toggleDropdown = (event?: Event) => {
      if (event) {
        event.stopPropagation()
        event.preventDefault()
      }
      dropdownOpen.value = !dropdownOpen.value
    }

    const localeLabel = (localeItem: Locale) => {
      const current = props.customLabels[localeItem.code] || localeItem.displayName
      return current || localeItem.code
    }

    const currentLocaleLabel = computed(() => {
      const current = locales.value.find(l => l.code === currentLocale.value)
      return current ? localeLabel(current) : currentLocaleName.value || currentLocale.value
    })

    const handleSwitchLocale = async (code: string) => {
      dropdownOpen.value = false // Закрываем сразу
      // Даем время Vue обновить DOM перед навигацией
      await nextTick()
      if (switchLocale) {
        switchLocale(code)
      }
    }

    // Default Styles
    const wrapperStyle: CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      verticalAlign: 'middle',
    }

    const buttonStyle: CSSProperties = {
      padding: '4px 12px',
      fontSize: '16px',
      cursor: 'pointer',
      backgroundColor: '#fff',
      border: '1px solid #333',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }

    const dropdownStyle: CSSProperties = {
      position: 'absolute',
      top: '100%',
      left: '0',
      zIndex: 1000,
      backgroundColor: '#fff',
      border: '1px solid #333',
      listStyle: 'none',
      padding: '0',
      margin: '4px 0 0 0',
      minWidth: '150px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }

    const itemStyle: CSSProperties = {
      margin: '0',
      padding: '0',
    }

    const linkStyle: CSSProperties = {
      display: 'block',
      padding: '8px 12px',
      color: '#333',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease',
      cursor: 'pointer',
    }

    const activeLinkStyle: CSSProperties = {
      fontWeight: 'bold',
      color: '#007bff',
    }

    const iconStyle: CSSProperties = {
      marginLeft: '8px',
      display: 'inline-block',
      transition: 'transform 0.3s ease',
    }

    const openIconStyle: CSSProperties = {
      transform: 'rotate(180deg)',
    }

    const normalizeSlot = (slotResult: unknown): (VNode | string)[] => {
      if (!slotResult) return []
      return Array.isArray(slotResult) ? slotResult : [slotResult as VNode]
    }

    // Упрощенная и надежная логика клика снаружи
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownOpen.value) return

      const target = event.target as HTMLElement
      if (!target || !wrapperRef.value) return

      // Проверяем, что клик не внутри нашего враппера
      const isClickInside = wrapperRef.value.contains(target)

      // Также проверяем, не является ли цель кнопкой переключателя
      const isButtonClick = target.closest('.i18n-switcher-button') !== null

      if (!isClickInside && !isButtonClick) {
        dropdownOpen.value = false
      }
    }

    onMounted(() => {
      // Используем обычное всплытие, но с небольшой задержкой, чтобы дать время dropdown открыться
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => {
      const children: (VNode | string)[] = []

      // 1. Button rendering
      if (slots['before-button']) {
        children.push(...normalizeSlot(slots['before-button']()))
      }

      const buttonContent: (VNode | string)[] = []
      if (slots['before-selected-locale']) {
        buttonContent.push(...normalizeSlot(slots['before-selected-locale']()))
      }

      buttonContent.push(h('span', currentLocaleLabel.value))

      if (slots['after-selected-locale']) {
        buttonContent.push(...normalizeSlot(slots['after-selected-locale']()))
      }

      buttonContent.push(
        h('span', {
          style: {
            ...iconStyle,
            ...(dropdownOpen.value ? openIconStyle : {}),
            ...props.customIconStyle,
          },
        }, '▼'),
      )

      children.push(
        h('button', {
          class: 'i18n-switcher-button',
          style: { ...buttonStyle, ...props.customButtonStyle },
          onClick: (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            toggleDropdown(e)
          },
          type: 'button',
          ariaHaspopup: true,
          ariaExpanded: dropdownOpen.value,
        }, buttonContent),
      )

      // 2. Dropdown rendering
      if (slots['before-dropdown']) {
        children.push(...normalizeSlot(slots['before-dropdown']()))
      }

      if (dropdownOpen.value) {
        const dropdownItems: VNode[] = []

        if (slots['before-dropdown-items']) {
          dropdownItems.push(...(normalizeSlot(slots['before-dropdown-items']()) as VNode[]))
        }

        locales.value.forEach((localeItem) => {
          const itemChildren: (VNode | string)[] = []

          if (slots['before-item']) {
            itemChildren.push(...normalizeSlot(slots['before-item']({ locale: localeItem })))
          }

          const linkContent: (VNode | string)[] = []
          if (slots['before-link-content']) {
            linkContent.push(...normalizeSlot(slots['before-link-content']({ locale: localeItem })))
          }
          linkContent.push(localeLabel(localeItem))
          if (slots['after-link-content']) {
            linkContent.push(...normalizeSlot(slots['after-link-content']({ locale: localeItem })))
          }

          // Генерируем маршрут безопасно (без навигации, только для отображения)
          const routeTo = localeRoute ? localeRoute(router?.currentRoute.value || '/', localeItem.code) : '#'
          const isActive = localeItem.code === currentLocale.value

          itemChildren.push(
            h('a', {
              class: `switcher-locale-${localeItem.code}`,
              href: typeof routeTo === 'string' ? routeTo : '#',
              style: {
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
                ...props.customLinkStyle,
              },
              // Предотвращаем стандартную навигацию, используем только switchLocale
              onClick: (e: MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                handleSwitchLocale(localeItem.code)
              },
            }, linkContent),
          )

          if (slots['after-item']) {
            itemChildren.push(...normalizeSlot(slots['after-item']({ locale: localeItem })))
          }

          dropdownItems.push(
            h('li', {
              key: localeItem.code,
              style: { ...itemStyle, ...props.customItemStyle },
            }, itemChildren),
          )
        })

        if (slots['after-dropdown-items']) {
          dropdownItems.push(...(normalizeSlot(slots['after-dropdown-items']()) as VNode[]))
        }

        // Рендерим UL прямо здесь, БЕЗ Teleport
        children.push(
          h('ul', {
            class: 'i18n-switcher-dropdown',
            style: { ...dropdownStyle, ...props.customDropdownStyle },
          }, dropdownItems),
        )
      }

      if (slots['after-dropdown']) {
        children.push(...normalizeSlot(slots['after-dropdown']()))
      }

      // Возвращаем wrapper с ref
      return h('div', {
        ref: wrapperRef,
        class: 'i18n-switcher-wrapper',
        style: { ...wrapperStyle, ...props.customWrapperStyle },
      }, children)
    }
  },
})
