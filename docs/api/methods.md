---
outline: deep
---

# 🛠️ Methods

## 🌍 `$getLocaleCode`

Returns the current locale object.

**Type**: `() => string`

**Example**:

```typescript
const locale = $getLocaleCode();
```

**Output**

```typescript
// Assuming the current locale is English
"en";
```

## 🌍 `$getLocale`

Returns the current locale object.

**Type**: `() => Locale`

**Example**:

```typescript
const locale = $getLocale();
```

**Output**

```typescript
// Assuming the current locale is English
{ code: 'en', iso: 'en-US', dir: 'ltr', displayName: 'English' }
```

## 🌍 `$getLocales`

Returns an array of all available locales configured in the module.

Values are predefined inside the `nuxt.config.ts`

**Type**: `() => Array<{ code: string; iso?: string; dir?: string, disabled?: boolean, displayName: string }>`

**Example**:

```typescript
const locales = $getLocales();
```

**Output**

```typescript
[
  { code: "en", iso: "en-US", dir: "ltr", displayName: "English" },
  { code: "fr", iso: "fr-FR", dir: "ltr" },
];
```

## 🔍 `$getRouteName`

Retrieves the base route name without any locale-specific prefixes or suffixes.

**Type**: `(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => string`

**Parameters**:

- **route**: `RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric | undefined` — Optional. The route object from which to extract the name.
- **locale**: `string | undefined` — Optional. The locale code to consider when extracting the route name.

**Example**:

```typescript
const routeName = $getRouteName(routeObject, "fr");
```

**Output**:

```typescript
// assuming the base route name is 'index'
"index";
```

## 🔍 `$t`

Fetches a translation for the given key. Optionally interpolates parameters.

**Type**: `(key: string, params?: Record<string, any>, defaultValue?: string) => string`

**Parameters**:

- **key**: `string` — The translation key.
- **params**: `Record<string, any> | undefined` — Optional. A record of key-value pairs to interpolate into the translation.
- **defaultValue**: `string | undefined` — Optional. The default value to return if the translation is not found.

**Example**:

```typescript
const welcomeMessage = $t("welcome", { username: "Alice", unreadCount: 5 });
```

**Output**:

```typescript
"Welcome, Alice! You have 5 unread messages.";
```

## 🔢 `$tc`

Fetches a pluralized translation for the given key based on the count.

**Type**: `(key: string, count: number, defaultValue?: string) => string`

**Parameters**:

- **key**: `string` — The translation key.
- **count**: `number` — The count for pluralization.
- **defaultValue**: `string | undefined` — Optional. The default value to return if the translation is not found.

**Example**:

```typescript
const appleCountMessage = $tc("apples", 10);
```

**Output**:

```typescript
// assuming the plural rule for 'apples' is defined correctly
"10 apples";
```

## 🔢 `$tn`

Formats a number according to the current locale using `Intl.NumberFormat`.

**Type**: `(value: number, options?: Intl.NumberFormatOptions) => string`

**Parameters**:

- **value**: `number` — The number to format.
- **options**: `Intl.NumberFormatOptions | undefined` — Optional. `Intl.NumberFormatOptions` to customize the formatting.

**Example**:

```typescript
const formattedNumber = $tn(1234567.89, { style: "currency", currency: "USD" });
```

**Output**:

```typescript
// Assuming the locale is English
"$1,234,567.89";
```

### Use Cases:

- Formatting numbers as currency, percentages, or decimals in the appropriate locale format.
- Customizing the number format using `Intl.NumberFormatOptions` such as currency, minimum fraction digits, etc.

## 📅 `$td`

Formats a date according to the current locale using `Intl.DateTimeFormat`.

**Type**: `(value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string`

**Parameters**:

- **value**: `Date | number | string` — The date to format, which can be a `Date` object, a timestamp, or a date string.
- **options**: `Intl.DateTimeFormatOptions | undefined` — Optional. `Intl.DateTimeFormatOptions` to customize the formatting.

**Example**:

```typescript
const formattedDate = $td(new Date(), {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
```

**Example**:

```typescript
// Assuming the locale is English
"Friday, September 1, 2023";
```

### Use Cases:

- Displaying dates in a format that aligns with the user's locale, including long or short date formats.
- Customizing date output using options like weekday names, time formats, and timezone settings.

## 🔄 `$switchLocaleRoute`

Return current route with the given locale

**Type**: `(locale: string) => RouteLocationRaw`

**Parameters**:

- **locale**: `string` — Target locale.

**Example**:

```typescript
// Currnet route: /en/news
const routeFr = $switchLocaleRoute("fr");
```

**Output**:

```typescript
// A route object with the new locale applied, e.g.,
{ name: 'localized-news', params: { locale: 'fr' } }
```

## 🔄 `$switchLocalePath`

Return url of current route with the given locale

**Type**: `(locale: string) => string`

**Parameters**:

- **locale**: `string` — Target locale.

**Example**:

```typescript
// Currnet route: /en/news
const routeFr = $switchLocaleRoute("fr");
window.location.href = routeFr;
```

**Output**:

```typescript
// url with new locale applied, e.g.,
"/fr/nouvelles";
```

## 🔄 `$switchLocale`

Switches to the given locale and redirects the user to the appropriate localized route.

**Type**: `(locale: string) => void`

**Parameters**:

- **locale**: `string` — The locale to switch to.

**Action**: Redirects the user to the French version of the route

**Attention**: Be aware that this will trigger a page navigation

**Example**:

```typescript
$switchLocale("fr");
```

## 🔄 `$setI18nRouteParams`

set localized versions of params for all switchLocale\* methods and returns passed value
MUST be called inside useAsyncData

**Type**: `(value: Record<LocaleCode, Record<string, string>> | null) => Record<LocaleCode, Record<string, string>> | null`

**Parameters**:

- **value**: `Record<LocaleCode, Record<string, string>> | null` — params of current route for other locale

**Example**:

```typescript
// in pages/news/[id].vue
// for en/news/1-first-article
const { $switchLocaleRoute, $setI18nRouteParams, $defineI18nRoute } = useI18n();
// OR
const { $switchLocaleRoute, $setI18nRouteParams, $defineI18nRoute } = useNuxtApp();
$defineI18nRoute({
  localeRoutes: {
    en: '/news/:id()',
    fr: '/nouvelles/:id()',
    de: '/Nachricht/:id()',
  },
})
const { data: news } = await useAsyncData(`news-${params.id}`, async () => {
  let response = await $fetch("/api/getNews", {
    query: {
      id: params.id,
    },
  });
  if (response?.localeSlugs) {
    response.localeSlugs = {
      en: {
        id: '1-first-article'
      }
      fr: {
        id: '1-premier-article'
      }
      de: {
        id: '1-erster-Artikel'
      }
    }
    $setI18nRouteParams(response?.localeSlugs);
  }
  return response;
});
$switchLocalePath('fr') // === 'fr/nouvelles/1-premier-article'
$switchLocalePath('de') // === 'de/Nachricht/1-erster-Artikel'
```

## 🌐 `$localeRoute`

Generates a localized route object based on the target route.

**Type**: `(to: RouteLocationRaw, locale?: string) => RouteLocationResolved`

**Parameters**:

- **to**: `RouteLocationRaw` — The target route object.
- **locale**: `string | undefined` — Optional. The locale for the generated route.

**Example**:

```typescript
const localizedRoute = $localeRoute({ name: "index" });
```

**Output**:

```typescript
//  A route object with the current locale applied, e.g.,
{ name: 'index', params: { locale: 'fr' } }
```

## 🔄 `$localePath`

Return url based on the target route

**Type**: `(to: RouteLocationRaw, locale?: string) => string`

**Parameters**:

- **to**: `RouteLocationRaw` — The target route object.
- **locale**: `string | undefined` — Optional. The locale for the generated route.

**Example**:

```typescript
const localizedRoute = $localeRoute({ name: "news" });
```

**Output**:

```typescript
// Url with new locale applied, e.g.,
"/en/nouvelles";
```

## 🗂️ `$mergeTranslations`

Merges new translations into the existing translation cache for the current route and locale.

**Type**: `(newTranslations: Record<string, string>) => void`

**Parameters**:

- **newTranslations**: `Record<string, string>` — The new translations to merge.

**Action**: Updates the translation cache with the new French translation

**Example**:

```typescript
$mergeTranslations({
  welcome: "Bienvenue, {username}!",
});
```

## 🚦 `$defineI18nRoute`

Defines route behavior based on the current locale. This method can be used to control access to specific routes based on available locales, provide translations for specific locales, or set custom routes for different locales.

**Type**: `(routeDefinition: { locales?: string[] | Record<string, Record<string, TranslationObject>>, localeRoutes?: Record<string, string> }) => void`

**Parameters**:

- **locales**: `string[] | Record<string, Record<string, TranslationObject>>` — This property determines which locales are available for the route.
- **localeRoutes**: `Record<string, string> | undefined` — Optional. Custom routes for specific locales.

**Example**:

```typescript
$defineI18nRoute({
  locales: {
    en: { greeting: "Hello", farewell: "Goodbye" },
    ru: { greeting: "Привет", farewell: "До свидания" },
  },
  localeRoutes: {
    ru: "/localesubpage",
  },
});
```

### Use Cases:

- **Controlling Access**: By specifying available locales, you can control which routes are accessible based on the current locale, ensuring that users only see content relevant to their language.

- **Providing Translations**: The `locales` object allows for providing specific translations for each route, enhancing the user experience by delivering content in the user's preferred language.

- **Custom Routing**: The `localeRoutes` property offers flexibility in defining different paths for specific locales, which can be particularly useful in cases where certain languages or regions require unique navigational flows or URLs.

This function offers a flexible way to manage routing and localization in your Nuxt application, making it easy to tailor the user experience based on the language and region settings of your audience.

### Example 1: Controlling Access Based on Locales

```typescript
import { useNuxtApp } from "#imports";

const { $defineI18nRoute } = useNuxtApp();

$defineI18nRoute({
  locales: ["en", "fr", "de"], // Only these locales are allowed for this route
});
```

### Example 2: Providing Translations for Locales

```typescript
import { useNuxtApp } from "#imports";

const { $defineI18nRoute } = useNuxtApp();

$defineI18nRoute({
  locales: {
    en: { greeting: "Hello", farewell: "Goodbye" },
    fr: { greeting: "Bonjour", farewell: "Au revoir" },
    de: { greeting: "Hallo", farewell: { aaa: { bbb: "Auf Wiedersehen" } } },
    ru: {}, // Russian locale is allowed but no translations are provided
  },
});
```

### 📝 Explanation:

- **Locales Array**: If you only want to specify which locales are allowed for a route, pass an array of locale codes. The user will only be able to access this route if the current locale is in this list.
- **Locales Object**: If you want to provide specific translations for each locale, pass an object where each key is a locale code. The value should be an object with key-value pairs for translations. If you do not wish to provide translations for a locale but still want to allow access, pass an empty object (`{}`) for that locale.

## 💻 Example Usage in a Component

Here's an example of how to use these methods in a Nuxt component:

```vue
<template>
  <div>
    <p>{{ $t("key2.key2.key2.key2.key2") }}</p>
    <p>Current Locale: {{ $getLocale() }}</p>

    <div>
      {{ $t("welcome", { username: "Alice", unreadCount: 5 }) }}
    </div>
    <div>
      {{ $tc("apples", 10) }}
    </div>

    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale"
        :disabled="locale === $getLocale()"
        @click="() => $switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>

    <div>
      <NuxtLink :to="$localeRoute({ name: 'index' })"> Go to Index </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "#imports";

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t, $tc } =
  useI18n();
</script>
```

## 🛠️ `useNuxtApp`

**Example:**

```typescript
import { useNuxtApp } from "#imports";

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } =
  useNuxtApp();
```

## 🧩 `useI18n` Composable

**Example:**

```typescript
import { useI18n } from "#imports";

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useI18n();
// or
const i18n = useI18n();
```
