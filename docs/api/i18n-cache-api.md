# Working with Translations and Cache

This guide is for developers who want to customize or extend how translations are loaded, stored, cached, and updated in the i18n system. All translation data is stored in JSON files, and server-side logic is used to manage them with cache support.

## 📦 Cache Structure

Translation cache is stored using `useStorage('assets:server')`.

Each cache entry matches one translation JSON file. The cache keys follow the same structure as the file paths:

```
_locales/en.json
_locales/pages/home/en.json
```

### Example of cached data:

```json
{
  "title": "Page Title",
  "description": "Localized description",
  "button": {
    "text": "Click me",
    "tooltip": "Click to continue"
  }
}
```

The structure is the same as the content of the JSON files.

## 📥 Load translation from cache

### Server route

```ts
// server/api/i18n/load-cache.[post].ts
import { defineEventHandler, readBody } from 'h3'
import { useStorage } from '#imports'

export default defineEventHandler(async (event) => {
  const { key } = await readBody<{ key: string }>(event)
  const storage = useStorage('assets:server')

  const data = await storage.getItem(key)
  return {
    from: 'cache',
    key,
    data
  }
})
```

### Example usage

```ts
await $fetch('/api/i18n/load-cache', {
  method: 'POST',
  body: {
    key: '_locales/pages/home/en.json'
  }
})
```

## 📂 Load translation from file

### Server route

```ts
// server/api/i18n/load-file.[post].ts
import { defineEventHandler, readBody, createError } from 'h3'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const { path } = await readBody<{ path: string }>(event)

  try {
    const fileContent = await readFile(join('locales', path), 'utf-8')
    return {
      from: 'file',
      path,
      data: JSON.parse(fileContent)
    }
  } catch (err) {
    throw createError({
      statusCode: 404,
      statusMessage: `File not found: ${path}`
    })
  }
})
```

### Example usage

```ts
await $fetch('/api/i18n/load-file', {
  method: 'POST',
  body: {
    path: 'pages/home/en.json'
  }
})
```

## 🛠 Update translations (file + cache)

### Server route

```ts
// server/api/i18n/update.[post].ts
import { defineEventHandler, readBody, createError } from 'h3'
import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { useStorage } from '#imports'

function deepMerge(target: any, source: any): any {
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor') continue
    if (Array.isArray(source[key])) {
      target[key] = source[key]
    } else if (typeof source[key] === 'object' && source[key]) {
      target[key] = deepMerge(target[key] || {}, source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

export default defineEventHandler(async (event) => {
  const { path, updates } = await readBody<{ path: string, updates: Record<string, any> }>(event)

  if (!path || !updates) {
    throw createError({ statusCode: 400, statusMessage: 'Missing path or updates' })
  }

  const fullPath = join('locales', path)
  let existing = {}

  try {
    const content = await readFile(fullPath, 'utf-8')
    existing = JSON.parse(content)
  } catch {
    // File does not exist — create new
  }

  const merged = deepMerge(existing, updates)

  await writeFile(fullPath, JSON.stringify(merged, null, 2), 'utf-8')

  const serverStorage = useStorage('assets:server')
  await serverStorage.setItem(join('_locales', path), merged)

  return {
    success: true,
    path,
    updated: merged
  }
})
```

### Example usage

```ts
await $fetch('/api/i18n/update', {
  method: 'POST',
  body: {
    path: 'pages/home/en.json',
    updates: {
      header: 'New header',
      footer: {
        text: 'Updated Footer'
      }
    }
  }
})
```

## 🧪 Optional Extensions

### Delete translation keys

You can allow deleting keys by checking for a `__delete` array in the request:

```ts
if ('__delete' in body) {
  const keysToDelete = body.__delete
  for (const key of keysToDelete) {
    delete existing[key]
  }
}
```

### Replace arrays instead of merging

If you don’t want to merge arrays and just replace them:

```ts
if (Array.isArray(source[key])) {
  target[key] = [...source[key]]
}
```

## 💡 Tips for Developers

- Cache keys always match translation file paths, prefixed with `_locales/`.
- Cached data must always match the contents of the actual files.
- If you are building a translation editor, combine `load-cache` and `update` for read/write access.
- You can extract helpers like `deepMerge()` or key/path generators into a separate utility file.

## 🧹 Clearing All Server Cache

The i18n system uses in-memory cache (not `useStorage`) to speed up translation lookups on the server side. This cache is automatically populated when translations are loaded.

If you need to reset this cache (e.g. after editing translation files), you can call the `clearCache` method.

### 🔁 Example: programmatic cache clearing from the client

You can create a simple internal page that clears the cache when opened:

```vue
<template>
  <div class="container">
    <p>Clearing translation cache...</p>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $clearCache } = useNuxtApp()

$clearCache()
</script>
```

You can use this page manually, call it after deployment, or trigger it from an admin panel.

---

You now have full control over reading, updating and caching translations in your i18n system. You can adjust these routes to fit your needs, build admin tools, or integrate external translation APIs.
