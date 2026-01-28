# План рефакторинга packages/route-generator

## 1. Цели

- Устранить «God Class»: `RouteGenerator` не должен парсить конфиг, рекурсивно ходить по дереву, вычислять пути и жонглировать стратегиями в одном месте.
- Ввести **Strategy Pattern** с «умными» стратегиями: стратегия отвечает на вопрос «вот страница — какие маршруты вернуть?» и возвращает **готовые данные**, а не флаги.
- По возможности использовать **immutable-преобразования**: меньше мутаций, проще тестировать.
- Чёткое разделение слоёв: контекст → резолвер путей/имён → стратегии → оркестратор.
- Сохранить публичный API и поведение (обратная совместимость).

---

## 2. Текущее состояние

### 2.1 Структура

```
src/
  index.ts
  path-utils.ts     # isInternalPath, DEFAULT_STATIC_PATTERNS
  route-generator.ts # ~670 строк: класс RouteGenerator (God Class)
  utils.ts          # normalizeRouteKey, normalizePath, buildFullPath, ...
```

### 2.2 Проблемы

- **God Class** — один класс делает всё: парсит конфиг, рекурсивно обходит дерево, вычисляет пути, разветвляется по стратегиям, мутирует объекты. Сложно поддерживать и тестировать.
- **Условия по стратегиям** — проверки `isNoPrefixStrategy`, `isPrefixStrategy`, `isPrefixExceptDefaultStrategy`, `isPrefixAndDefaultStrategy` разбросаны по десяткам мест.
- **Смешение ответственностей** — нормализация конфига, извлечение localized paths, генерация маршрутов, алиасы, дочерние маршруты, постобработка в одном классе.
- **Процедурная логика с флагами** — даже при выносе в Handler остаётся куча флагов (shouldAddPrefix, removeUnprefixedDefaultRoutes, adjustDefaultLocaleRoute), что не делает код декларативным.

---

## 3. Основная концепция

Вместо одного класса с кучей `if (strategy === ...)` делаем **стратегии «умными»**.

**Генератор (`RouteGenerator`)** становится только **оркестратором**:

1. Подготавливает контекст (нормализует конфиг, извлекает localized paths).
2. Запускает цикл по страницам.
3. Делегирует создание маршрутов выбранной **стратегии**.

**Ключевое изменение: интерфейс стратегии**

Стратегия отвечает на вопрос: **«Вот страница. Какие маршруты я должна вернуть для неё?»**  
Она **не возвращает флаги** (shouldAddPrefix). Она **возвращает готовые данные** (массив маршрутов, постобработка списка).

**Вариант контракта (упрощённый — два метода):**

```ts
// src/strategies/types.ts
import type { NuxtPage } from '@nuxt/schema'
import type { GeneratorContext } from '../core/context'

export interface RouteStrategy {
  /**
   * Основной метод обработки страницы.
   * Принимает страницу и контекст, возвращает массив готовых маршрутов
   * (включая модифицированные исходные, например для дефолтной локали).
   */
  processPage(page: NuxtPage, context: GeneratorContext): NuxtPage[]

  /**
   * Постобработка всего массива страниц (например, удаление дублей или исходных маршрутов).
   */
  postProcess(pages: NuxtPage[], context: GeneratorContext): NuxtPage[]
}
```

Внутри `BaseStrategy`: `processPage` делегирует в абстрактный `generateVariants(page, ctx)`. Конкретная стратегия реализует только `generateVariants` и при необходимости переопределяет `postProcess`. Мутация оригинала (например, для prefix_except_default — подмена path/children у страницы дефолтной локали) выполняется внутри `generateVariants` перед push в результат.

Оркестратор в `extendPages` делает только:

- создание контекста (с передачей `pages` в Context, т.к. `extractLocalizedPaths` нужны страницы);
- получение стратегии: `getStrategy(this.strategy)`;
- цикл по страницам: `generated = strategy.processPage(page, ctx)` → `newRoutes.push(...generated)`;
- в конце: `finalRoutes = strategy.postProcess(newRoutes, ctx)` → залить обратно в `pages` (очистить `pages`, затем `pages.push(...finalRoutes)`).
- при необходимости: вызов `adjustRouteForDefaultLocale` (если стратегия этого требует — вынести в стратегию или оставить один общий шаг).

Вся ветвящаяся логика живёт **внутри** конкретного класса стратегии.

---

## 4. Новая структура проекта (итоговая)

```
src/
├── index.ts                     # Экспорт (RouteGenerator, типы, утилиты)
├── route-generator.ts           # Оркестратор (Facade)
├── types.ts                     # Общие типы пакета
│
├── utils/                       # Чистые функции (без состояния)
│   ├── path.ts                  # joinPath, normalizePath, normalizeRouteKey...
│   └── common.ts                # cloneArray, isRedirectOnly...
│
├── core/                        # Ядро (не зависит от конкретной стратегии)
│   ├── context.ts               # GeneratorContext — хранилище конфига и лукап путей
│   ├── builder.ts               # RouteBuilder / createRoute, resolveChildPath
│   ├── localized-paths.ts       # extractLocalizedPaths (global + files, рекурсия по children)
│   └── alias.ts                  # generateAliasRoutes — маршруты для алиасов страницы
│
└── strategies/                  # Реализации стратегий
    ├── types.ts                 # Интерфейс RouteStrategy
    ├── abstract.ts              # BaseStrategy (общая рекурсия localizeChildren)
    ├── factory.ts               # getStrategy(name): RouteStrategy
    ├── prefix.ts                # PrefixStrategy (самая простая для старта)
    ├── no-prefix.ts             # NoPrefixStrategy
    ├── prefix-and-default.ts    # PrefixAndDefaultStrategy
    └── prefix-except-default.ts  # PrefixExceptDefaultStrategy (самая сложная)
```

Примечание: отдельный `resolver.ts` можно не вводить на первом этапе — логику «какой путь/имя для этой локали» стратегии и Context могут делить между собой (Context даёт `getCustomPath`, стратегия собирает полный путь и имя при создании варианта). При росте дублирования вынести в `core/resolver.ts`.

---

## 5. Детальный разбор модулей

### 5.1 Контракты: src/strategies/types.ts

```ts
// src/strategies/types.ts
import type { NuxtPage } from '@nuxt/schema'
import type { GeneratorContext } from '../core/context'

export interface RouteStrategy {
  processPage(page: NuxtPage, context: GeneratorContext): NuxtPage[]
  postProcess(pages: NuxtPage[], context: GeneratorContext): NuxtPage[]
}
```

### 5.2 core/context.ts

**Задача:** «мозг» генератора — избавляет стратегии от ручного копания в globalLocaleRoutes/filesLocaleRoutes. Отвечает на вопрос: «Какой путь у этой страницы для этой локали?»

- **Важно:** контекст создаётся **внутри `extendPages`**, а не в конструкторе RouteGenerator, потому что `extractLocalizedPaths` нужен массив `pages` для предварительного сканирования путей.
- В конструкторе RouteGenerator храним только **конфиг** (locales, defaultLocale, strategy, globalRoutes, filesRoutes, routeLocales). Контекст создаём при вызове `extendPages(pages)`.
- **Алиасы:** в текущей реализации локализуются в основном пути страницы; кастомные переводы для алиасов (если появятся в конфиге) можно учесть в `extractLocalizedPaths` или добавить метод `getCustomPathForAlias(aliasPath, localeCode)` при необходимости. На первом этапе достаточно префиксировать алиасы через `generateAliasRoutes` (см. 5.11).

```ts
// src/core/context.ts (схема)
export class GeneratorContext {
  constructor(..., pages: NuxtPage[]) {
    this.localizedPaths = extractLocalizedPaths(pages, globalRoutes, filesRoutes)
    // ...
  }

  getAllowedLocales(pagePath: string, pageName: string): Locale[] { ... }
  getCustomPath(originalPath: string, localeCode: string): string | null { ... }
}
```

### 5.3 core/builder.ts (RouteBuilder / createRoute)

**Задача:** создание объекта `NuxtPage` — убрать дублирование кода вида `return { ...page, name: ..., path: ... }`; жёсткая логика слияния путей родитель/ребёнок.

- **createRoute(page, options):** принимает исходную страницу и опции (path, name, children, meta, alias), возвращает **новый объект** NuxtPage. Обязательно копировать meta, props, component, file и т.д.; при генерации отдельного маршрута для алиасов у «основного» локализованного маршрута поле `alias` можно очищать (undefined), чтобы алиасы были отдельными маршрутами.
- **resolveChildPath(parentPath: string, childSegment: string):** единая логика слияния пути родителя и сегмента ребёнка:
  - если `childSegment` **абсолютный** (начинается с `/` — типично для кастомных путей в конфиге), возвращать его (с учётом префикса локали, если стратегия требует);
  - если **относительный** — делать `join(parentPath, childSegment)`;
  - учитывать пустой/нормализованный путь (normalizePath).
- Размещение: `resolveChildPath` в `utils/path.ts` или `core/builder.ts`; при использовании в стратегиях и builder — в builder для связности.

### 5.4 core/localized-paths.ts

**Задача:** вынести логику **extractLocalizedPaths** в отдельный модуль.

- Вход: pages, globalLocaleRoutes, filesLocaleRoutes (и при необходимости routeLocales).
- Выход: структура «нормализованный ключ пути → localeCode → кастомный путь», которую хранит Context и отдаёт через `getCustomPath`.

### 5.5 strategies/abstract.ts (BaseStrategy)

**Задача:** инкапсулировать рекурсию. Конкретные стратегии думают только о трансформации одного узла; обход детей — общий.

- `processPage(page, ctx)` — общая логика: при необходимости пропуск redirect-only / internal; делегирование в `generateVariants(page, ctx)`.
- `postProcess(pages, ctx)` — по умолчанию возвращает `pages` без изменений.
- **Критично:** при рекурсии в детей для поиска кастомного пути в Context нужен **оригинальный** путь страницы (как в дереве Nuxt), а не уже локализованный. Иначе lookup в `getCustomPath(originalPath, locale)` даёт неверный ключ и теряется вложенность.

**Сигнатура localizeChildren — два пути родителя:**

```ts
// src/strategies/abstract.ts (схема)
protected localizeChildren(
  children: NuxtPage[],
  parentLocalizedPath: string,  // Для построения path новой страницы (уже с префиксом/кастомом)
  parentOriginalPath: string,  // Для поиска в Context: getCustomPath(childOriginalPath, locale)
  locale: string,
  ctx: GeneratorContext
): NuxtPage[]
```

- Для каждого ребёнка: `childOriginalPath = joinPath(parentOriginalPath, child.path)` (или resolveChildPath по оригинальным путям); кастомный путь — `ctx.getCustomPath(childOriginalPath, locale)`; итоговый путь ребёнка — через `resolveChildPath(parentLocalizedPath, child.path)` с учётом кастомного пути. Затем рекурсивно вызвать создание вариантов и собрать результат.

### 5.6 strategies/prefix-except-default.ts (пример сложной стратегии)

Делает две вещи: (1) для дефолтной локали возвращает **один маршрут** (без префикса, с кастомным путём при наличии); (2) создаёт копии для остальных локалей с префиксом.

- **Мутация vs Immutability:** не мутировать оригинальный объект `page` из аргументов. Для дефолтной локали возвращать **новый объект** (клон через `createRoute`), у которого path/children подставлены под дефолтную локаль. Оркестратор уже делает `pages.length = 0` и `pages.push(...newRoutes)` — важно, чтобы стратегия не сохраняла ссылку на старый объект и не полагалась на мутацию. RouteBuilder при создании маршрута делает deep/shallow clone с подстановкой полей.
- Дефолтная локаль: создать вариант через `createRoute(page, { path: customPath ?? page.path, children: localizeChildren(..., parentOriginalPath) })` и добавить в результат.
- Остальные локали: для каждой — fullPath с префиксом, name = `localized-${page.name}-${code}`, дети через `localizeChildren(..., parentLocalizedPath, parentOriginalPath, ...)`, `createRoute(page, { path, name, children })` → push в результат.

### 5.7 strategies/prefix.ts (стартовая стратегия для проверки концепции)

**Самая простая:** не мутирует оригинал, создаёт новые маршруты для всех локалей с префиксом, в `postProcess` удаляет исходные непрефиксные маршруты (кроме internal/редиректов). Позволяет проверить цепочку Context → Builder → Strategy → Facade без сложности prefix_except_default.

### 5.8 strategies/factory.ts

- `getStrategy(strategyName: Strategies): RouteStrategy` — switch/мап по названию, возврат экземпляра нужного класса.

### 5.9 route-generator.ts (фасад)

- Конструктор: сохраняет конфиг (locales, defaultLocale как строка + поиск объекта локали, strategy, globalRoutes, filesRoutes, routeLocales). Контекст **не** создаётся здесь.
- `extendPages(pages: NuxtPage[])`:
  1. Создать контекст: `ctx = new GeneratorContext(..., pages)`.
  2. `strategyHandler = getStrategy(this.config.strategy)`.
  3. Собрать маршруты: `originalPages = [...pages]`, `pages.length = 0`, цикл `for (const page of originalPages) { newRoutes.push(...strategyHandler.processPage(page, ctx)) }`.
  4. Постобработка: `finalRoutes = strategyHandler.postProcess(newRoutes, ctx)`.
  5. Вернуть в Nuxt: `pages.push(...finalRoutes)`.

Nuxt hook extendPages ожидает мутацию переданного массива — поэтому очищаем и заливаем обратно.

### 5.10 utils/

- **path.ts** — joinPath, normalizePath, removeLeadingSlash, normalizeRouteKey (из текущих path-utils и utils). При необходимости сюда же вынести `resolveChildPath(parentPath, childSegment)` (см. 5.3).
- **common.ts** — cloneArray, isPageRedirectOnly (и при необходимости isInternalPath, если не в path).

### 5.11 core/alias.ts (обработка алиасов)

**Задача:** в старом коде `handleAliasRoutes` берёт алиасы страницы, локализует их (добавляет префикс) и создаёт отдельные объекты маршрутов, которые пушатся в additionalRoutes. Без явной генерации алиасов они останутся нелокализованными или пропадут, если стратегия возвращает новый объект без копирования алиасов.

- **Логика:** вынести в общую функцию (стратегии вызывают её внутри `generateVariants`):
  - `generateAliasRoutes(originalPage: NuxtPage, localizedPath: string, locale: string, strategy: Strategies): NuxtPage[]`
  - для каждого алиаса из `originalPage.alias` — применить префикс (если стратегия с префиксом), создать отдельный NuxtPage (path = локализованный алиас, тот же component/file, без дублирования alias в основном маршруте).
- **RouteBuilder:** при создании «основного» локализованного маршрута поле `alias` можно не копировать или ставить `undefined`, если мы генерируем отдельные маршруты для алиасов (как в старом коде: у generated route `alias: undefined`).
- **processPage / generateVariants:** возвращаемый массив может содержать и основные маршруты, и маршруты-алиасы; стратегии вызывают `generateAliasRoutes` и пушат результат в массив вариантов.

```ts
// core/alias.ts (схема)
export function generateAliasRoutes(
  originalPage: NuxtPage,
  localizedPath: string,  // уже с префиксом
  locale: string,
  strategy: Strategies
): NuxtPage[]
```

---

## 6. Критические моменты (вложенность и алиасы)

Четыре момента, которые нужно учесть до реализации, иначе на этапе кодирования появятся «непонятные баги» с вложенностью и алиасами.

### 6.1 Потеря контекста «оригинального пути» при рекурсии

В старом коде при рекурсии используется и родительский локализованный путь (для построения path новой страницы), и цепочка оригинальных путей. Для поиска в конфиге (`localizedPaths` / `getCustomPath`) нужен **полный оригинальный путь** страницы (например `/parent/child`), а не уже локализованный (`/de/parent/child`).

**Проблема:** если в `localizeChildren` передавать только `parentPath` (уже локализованный), при спуске к ребёнку мы не знаем оригинальный путь ребёнка для lookup в Context.

**Решение:** в сигнатуру рекурсии добавить **parentOriginalPath**:

- `parentLocalizedPath` — для построения path новой страницы (join с child.path, префикс и т.д.).
- `parentOriginalPath` — для поиска в Context: `childOriginalPath = joinPath(parentOriginalPath, child.path)`, затем `ctx.getCustomPath(childOriginalPath, locale)`.

См. обновлённую сигнатуру в 5.5.

### 6.2 Обработка алиасов (Alias)

В старом коде есть `handleAliasRoutes`: алиасы страницы локализуются (префикс) и создаются отдельные объекты маршрутов, которые пушатся в additionalRoutes.

**Риск:** если забыть про алиасы, они останутся нелокализованными или пропадут при возврате нового объекта без копирования алиасов.

**Решение:**

- RouteBuilder при создании основного локализованного маршрута может не копировать/очищать `alias` (alias: undefined), если генерируем отдельные маршруты для алиасов.
- `processPage` / `generateVariants` возвращают массив, в котором есть и основные маршруты, и маршруты-алиасы.
- Логику генерации алиасов вынести в **core/alias.ts** (`generateAliasRoutes`); стратегии вызывают её внутри `generateVariants` (логика общая: «применить префикс к списку строк»).

См. 5.11.

### 6.3 «Умное» слияние путей родитель–ребёнок

В старом коде логика слияния (path.posix.join) размазана. В prefix_except_default: если у родителя кастомный путь, а у ребёнка нет — ребёнок должен корректно приклеиться к кастомному родителю. Если кастомный путь ребёнка абсолютный (`/foo`), он не должен склеиваться с путём родителя.

**Риск:** некорректный join при абсолютном customPath или пустом normalizedPath.

**Решение:** единая функция **resolveChildPath(parentPath, childSegment)** (в utils/path.ts или core/builder.ts):

- если `childSegment` абсолютный — возвращать его (с учётом префикса локали, если нужно);
- если относительный — join(parentPath, childSegment);
- учитывать пустой/нормализованный путь.

См. 5.3.

### 6.4 Мутация vs Immutability в PrefixExceptDefault

План с `pages.length = 0` и `pages.push(...newRoutes)` корректен. Важно: стратегия PrefixExceptDefault **не должна мутировать** переданный объект `page`. Для дефолтной локали она возвращает **новый объект** (клон с изменённым path/children), а не тот же `page` с подменёнными полями. RouteBuilder при создании маршрута делает deep/shallow clone с подстановкой полей.

См. 5.6.

### 6.5 Итоговый вердикт

План надёжный. Если учесть **parentOriginalPath** в рекурсии и **явную генерацию маршрутов для алиасов** (core/alias.ts, копирование/очистку alias в createRoute), проблем быть не должно. Можно приступать к реализации.

---

## 7. План перехода (пошагово)

Чтобы не сломать тесты, рефакторинг вести поэтапно. Рекомендуемый порядок реализации: **utils** → **core/context + core/localized-paths** → **core/builder** → **strategies/abstract** → **strategies/prefix** (первый тест-драйв).

### Шаг 1: Вынос утилит (Utils Extraction)

- Создать папку `src/utils/`.
- Перенести содержимое `path-utils.ts` и `utils.ts` в `utils/path.ts` (joinPath, normalizePath, normalizeRouteKey, removeLeadingSlash) и `utils/common.ts` (cloneArray, isPageRedirectOnly, при необходимости isInternalPath).
- Добавить `utils/index.ts` с реэкспортами.
- В текущем `route-generator.ts` заменить импорты на импорты из `utils/`.
- **Критерий:** тесты проходят, сборка и линт зелёные.

### Шаг 2: Создание ядра — Context и localized-paths (Core Layer)

- **core/localized-paths.ts** — вынести логику `extractLocalizedPaths` в отдельную функцию; результат — структура путей (ключ → locale → path).
- **core/context.ts** — класс `GeneratorContext`: принимает locales, defaultLocale, strategy, globalRoutes, filesRoutes, routeLocales, **pages**; в конструкторе вызывает `extractLocalizedPaths(pages, globalRoutes, filesRoutes)` и сохраняет результат; методы `getAllowedLocales(pagePath, pageName)`, `getCustomPath(originalPath, localeCode)`.
- Пока **не** менять публичное поведение: старый `route-generator.ts` внутри может создавать Context в `extendPages` и использовать его там, где дублируется доступ к конфигу.
- **Критерий:** тесты проходят, `extractLocalizedPaths` и Context используются внутри текущего генератора.

### Шаг 3: RouteBuilder и resolveChildPath (core/builder.ts)

- Реализовать **resolveChildPath(parentPath, childSegment)** — единая логика слияния путей (абсолютный child → вернуть его; относительный → join).
- Реализовать **createRoute(page, options)**: принимает исходную страницу и опции (path, name?, children?, meta?, alias?), возвращает **новый объект** NuxtPage (deep/shallow clone, подстановка полей; копировать meta, props, component, file). При генерации отдельных маршрутов для алиасов у основного маршрута alias можно не копировать (undefined).
- Подключить builder в текущий `route-generator.ts` там, где создаются варианты маршрутов.
- **Критерий:** тесты проходят, меньше дублирования в коде генератора.

### Шаг 4: Внедрение стратегий — каркас и PrefixStrategy (первый тест-драйв)

- Описать интерфейс `RouteStrategy` (processPage, postProcess) в `strategies/types.ts`.
- Реализовать **BaseStrategy** в `strategies/abstract.ts`: `processPage` делегирует в `generateVariants`, `postProcess` по умолчанию возвращает pages; абстрактный `generateVariants`; защищённый метод **localizeChildren(children, parentLocalizedPath, parentOriginalPath, locale, ctx)** — общая рекурсия по детям с двумя путями родителя (см. 5.5, 6.1).
- Реализовать **PrefixStrategy** как самую простую: не мутирует оригинал, создаёт новые маршруты для всех локалей с префиксом, в `postProcess` удаляет непрефиксные маршруты (кроме internal/редиректов). Это позволяет проверить концепцию: Context → Builder → Strategy → Facade.
- В `route-generator.ts` в `extendPages`: для стратегии `prefix` заменить текущую логику на создание контекста, вызов `getStrategy('prefix')`, цикл processPage, postProcess, заливка обратно в pages.
- **Критерий:** тесты для стратегии `prefix` проходят.

### Шаг 5: Алиасы и остальные стратегии

- Реализовать **core/alias.ts** — `generateAliasRoutes(originalPage, localizedPath, locale, strategy)`. Стратегии вызывают её внутри `generateVariants` и пушат маршруты-алиасы в результат; у основного локализованного маршрута alias не копировать (undefined), см. 5.11, 6.2.
- Реализовать **NoPrefixStrategy**, **PrefixExceptDefaultStrategy** (без мутации оригинала — возвращать клон для дефолтной локали, см. 5.6, 6.4), **PrefixAndDefaultStrategy**.
- Добавить фабрику `getStrategy(name)` и в оркестраторе полностью перейти на стратегии: конфиг хранится в конструкторе, контекст создаётся в extendPages, цикл и postProcess через strategy.
- Удалить из route-generator все оставшиеся ветки по `isNoPrefixStrategy` / `isPrefixStrategy` и т.д.; при необходимости оставить один общий шаг `adjustRouteForDefaultLocale` (или вынести в стратегии).
- **Критерий:** все тесты (в т.ч. strategies.test.ts, глубокие вложенности, алиасы) проходят.

### Шаг 6: Финальная зачистка

- Удалить мёртвый код из route-generator. Класс — порядка 50 строк: хранение конфига, в extendPages — создание Context, getStrategy, цикл, postProcess, push обратно в pages.
- Проверить линтер, тесты, сборку, покрытие.
- Обновить комментарии/README по структуре пакета.

---

## 8. План действий для реализации (краткий чек-лист)

Такая структура позволит менять логику стратегий, не трогая парсинг конфига, и наоборот. Рекомендуемый порядок начала реализации:

1. **utils** (самое простое) — path.ts, common.ts, index.ts.
2. **core/context + core/localized-paths** (фундамент данных).
3. **core/builder** (инструмент: createRoute, resolveChildPath).
4. **strategies/abstract** (каркас логики: localizeChildren с parentLocalizedPath и parentOriginalPath).
5. **strategies/prefix** (первый тест-драйв).
6. **core/alias.ts** и остальные стратегии (no-prefix, prefix-except-default, prefix-and-default); фабрика; полное переключение оркестратора.

---

## 9. Обратная совместимость

- Публичный API пакета не меняется: экспорт из `src/index.ts` (RouteGenerator, утилиты, типы) — те же имена и сигнатуры.
- Поведение `extendPages`, `extractLocalizedPaths`, `adjustRouteForDefaultLocale` остаётся тем же; меняется только внутренняя реализация и разбиение по файлам.

---

## 10. Критерии готовности

- Нет файлов исходного кода > 250–300 строк (кроме возможно одного фасада).
- В оркестраторе (route-generator) нет прямых проверок `isNoPrefixStrategy` / `isPrefixStrategy` / и т.п. — только получение стратегии и вызов её методов.
- Вся логика по стратегиям сосредоточена в `strategies/` и возвращает готовые данные (маршруты, список после postProcess), а не флаги.
- Все текущие тесты проходят без изменений сценариев (допустимы правки импортов в тестах).
- Сборка и линт проходят.

---

## 11. Преимущества нового подхода

- **Изоляция:** решение «добавлять ли префикс» и «что удалять в конце» зашито внутри конкретного класса стратегии, а не размазано по коду.
- **Расширяемость:** новая стратегия (например, domain-based) — новый файл в `strategies/` и одна строка в фабрике.
- **Читаемость:** метод `generateVariants` читается как инструкция: «возьми разрешённые локали → построй путь и детей → верни массив маршрутов».
- **Упрощение рекурсии:** рекурсия не передаёт кучу флагов; контекст передаётся через объект Context.
- **Тестируемость:** стратегии и резолвер можно тестировать по отдельности с подставным контекстом.

---

## 12. Риски и митигация

- **Регрессии** — опираться на существующие тесты (в т.ч. снапшоты и глубокую вложенность); при необходимости добавить точечные тесты на стратегии до рефакторинга.
- **Переусложнение** — не вводить лишние абстракции; если какая-то стратегия окажется тривиальной, можно реализовать её одним небольшим классом без лишних слоёв.
- **Зависимости** — чётко соблюдать слои: utils (без зависимостей от core/strategies) → core (без зависимостей от strategies) → strategies (используют core и utils) → generator (использует strategies и core). Избегать циклических импортов.

---

## 13. Тесты перед рефакторингом (покрытие регрессий)

Перед началом реализации добавлены и зафиксированы тесты, чтобы после рефакторинга отловить возможные регрессии. Все перечисленные сценарии должны проходить до и после рефакторинга.

### 13.1 Файл tests/critical-scenarios.test.ts

Покрывает четыре критических момента из раздела 6 плана:

| Сценарий | Что проверяет |
|----------|----------------|
| **Original path lookup (parentOriginalPath)** | Вложенные страницы: родитель с кастомным путём, ребёнок без кастомного — путь ребёнка склеивается с локализованным путём родителя. Родитель и ребёнок с кастомными путями — lookup по полному оригинальному пути `/parent/child`. Ребёнок с абсолютным кастомным путём — путь не склеивается с родителем. |
| **Alias handling** | Алиасы — отдельные маршруты с локализованным (префиксным) путём. У основного локализованного маршрута `alias` пустой или undefined. Вложенная страница с алиасом — алиас-маршруты создаются и префиксятся. Все стратегии (no_prefix, prefix, prefix_and_default) с алиасами. |
| **Path joining (resolveChildPath)** | Родитель с кастомным путём + ребёнок с относительным сегментом — путь ребёнка = join(путь_родителя, segment). Пустой путь родителя (корень) + ребёнок — нормализация. |
| **Immutability** | Переданный массив `pages` заменяется (length = 0, push). Сохранённая ссылка на исходный объект страницы: после рефакторинга не должна мутироваться (path, children). Тест помечен skip до рефакторинга — убрать skip после внедрения стратегий. |
| **Meta, file** | Сгенерированный маршрут сохраняет meta и file исходной страницы. |
| **extractLocalizedPaths** | Ключи — полные оригинальные пути (в т.ч. вложенные `/parent/child`). |

### 13.2 Остальные тестовые файлы (что важно не сломать)

| Файл | Покрытие |
|------|----------|
| **strategies.test.ts** | Все четыре стратегии: prefix_except_default, prefix, prefix_and_default, no_prefix — базовые кейсы (статичные/динамические маршруты, вложенность, globalLocaleRoutes, routeLocales, отключение локализации). |
| **paths-and-alias.test.ts** | Internal paths, страницы без name, алиасы, алиасы + routeLocales, вложенность с кастомными путями на каждом уровне, prefix с удалением дефолтных, no_prefix с noPrefixRedirect, custom regex, filesLocaleRoutes, prefix_and_default с custom paths, redirect-only, смешанные ограничения. |
| **deep-nesting.test.ts** | Глубокая вложенность (4 и 6 уровней) для всех стратегий; globalLocaleRoutes на корне/листе/каждом уровне/только средний уровень; filesLocaleRoutes на каждом уровне; routeLocales на каждом уровне; extractLocalizedPaths для глубокой вложенности; комбинации. |
| **combinations.test.ts** | globalLocaleRoutes + filesLocaleRoutes + routeLocales в комбинациях (переопределение, ограничения, разные страницы). |
| **extract-localized-paths.test.ts** | Пустой массив, только global/files, вложенные страницы, false в globalLocaleRoutes, lookup по pageName. |
| **adjust-route.test.ts** | adjustRouteForDefaultLocale — редирект дефолтной локали. |
| **basic.test.ts**, **initialization.test.ts**, **locale-restrictions.test.ts**, **general.test.ts**, **advanced.test.ts**, **utils-and-edge.test.ts** | Инициализация, базовые сценарии, ограничения локалей, утилиты, краевые случаи. |

### 13.3 Рекомендация перед реализацией

1. Запустить полный набор тестов: `pnpm test` в `packages/route-generator` и убедиться, что все проходят (кроме помеченного skip в critical-scenarios).
2. После каждого шага рефакторинга (utils → core → strategies → …) снова запускать тесты; при падении — исправить до перехода к следующему шагу.
3. После внедрения стратегий убрать `test.skip` в critical-scenarios (immutability) и убедиться, что тест проходит.
4. Снапшоты обновлять только при осознанном изменении поведения; при рефакторинге поведение должно остаться тем же.
