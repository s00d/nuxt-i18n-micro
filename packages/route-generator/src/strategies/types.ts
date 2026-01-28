import type { NuxtPage } from '@nuxt/schema'
import type { GeneratorContext } from '../core/context'

export interface RouteStrategy {
  /**
   * Обрабатывает страницу: возвращает массив маршрутов (основные + алиасы и т.д.).
   */
  processPage(page: NuxtPage, context: GeneratorContext): NuxtPage[]

  /**
   * Постобработка всего массива страниц (например, удаление непрефиксных маршрутов).
   */
  postProcess(pages: NuxtPage[], context: GeneratorContext): NuxtPage[]
}
