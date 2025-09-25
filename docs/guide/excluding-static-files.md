# Excluding Static Files from i18n Routing

## Overview

By default, nuxt-i18n-micro automatically excludes common static files from i18n routing processing. However, you can also configure custom exclusion patterns to prevent specific paths from being processed by the i18n system.

## Built-in Exclusions

The module automatically excludes the following file types and patterns:

- **Sitemaps**: `/sitemap*.xml`, `/sitemap-en.xml`, etc.
- **SEO files**: `/robots.txt`, `/favicon.ico`
- **PWA files**: `/manifest.json`, `/sw.js`, `/workbox-*.js`
- **Static assets**: Files with extensions like `.xml`, `.txt`, `.ico`, `.json`, `.js`, `.css`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.woff`, `.woff2`, `.ttf`, `.eot`
- **Internal Nuxt paths**: Any path starting with `__` (like `/__nuxt/`)

## Custom Exclusion Patterns

You can define custom exclusion patterns using the `excludePatterns` option:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'it', iso: 'it-IT' }
    ],
    defaultLocale: 'en',
    
    // Custom exclusion patterns
    excludePatterns: [
      // String patterns (exact match or prefix)
      '/api/health',
      '/admin',
      
      // String patterns with wildcards
      '/api/*',
      '/admin/**',
      
      // Regular expressions
      /^\/api\/v\d+\//,
      /\.(pdf|doc|docx)$/,
    ]
  }
})
```

## Pattern Types

### String Patterns

- **Exact match**: `'/api/health'` - matches exactly `/api/health`
- **Prefix match**: `'/admin'` - matches `/admin` and `/admin/dashboard`
- **Wildcards**: `'/api/*'` - matches `/api/users` but not `/api/users/123`
- **Deep wildcards**: `'/admin/**'` - matches `/admin/users` and `/admin/users/123`

### Regular Expressions

Use RegExp objects for complex pattern matching:

```typescript
excludePatterns: [
  /^\/api\/v\d+\//,        // API versioned routes
  /\.(pdf|doc|docx)$/,     // Document files
  /^\/static\//,           // Static directory
  /^\/[a-z]{2}\/api\//,    // Localized API routes
]
```

## Use Cases

### SEO Files
```typescript
excludePatterns: [
  '/sitemap.xml',
  '/sitemap-*.xml',
  '/robots.txt',
  '/favicon.ico'
]
```

### API Routes
```typescript
excludePatterns: [
  '/api/**',
  '/graphql',
  '/webhook/**'
]
```

### Admin Panels
```typescript
excludePatterns: [
  '/admin',
  '/admin/**',
  '/dashboard'
]
```

### Static Assets
```typescript
excludePatterns: [
  '/assets/**',
  '/static/**',
  '/uploads/**'
]
```

## How It Works

1. **Server Middleware**: A Nitro middleware runs first to check exclusion patterns
2. **Page Processing**: During page resolution, excluded paths are skipped
3. **Catch-all Route**: The fallback route checks exclusions before processing
4. **Prerendering**: Excluded paths are not included in prerendered routes

## Performance Impact

- Exclusion checks are optimized and run early in the request lifecycle
- Built-in patterns use efficient regex matching
- Custom patterns are cached and reused
- Minimal performance overhead for excluded paths

## Troubleshooting

### Static Files Still Being Intercepted

1. **Check pattern syntax**: Ensure your patterns match the exact path structure
2. **Use regex for complex patterns**: String wildcards have limitations
3. **Test patterns**: Use browser dev tools to verify the actual request path
4. **Check order**: Ensure exclusion patterns are defined before other i18n config

### Pattern Not Working

```typescript
// ❌ Wrong - this won't work
excludePatterns: ['sitemap.xml']

// ✅ Correct - include leading slash
excludePatterns: ['/sitemap.xml']

// ✅ Better - use regex for flexibility
excludePatterns: [/^\/sitemap.*\.xml$/]
```

### Debug Mode

Enable debug mode to see exclusion processing:

```typescript
i18n: {
  debug: true,
  excludePatterns: ['/api/**']
}
```

This will log exclusion decisions in the console.

## Migration from Workarounds

If you were using workarounds like route rules or middleware, you can now replace them with `excludePatterns`:

```typescript
// ❌ Old workaround
export default defineNuxtConfig({
  routeRules: {
    '/sitemap*.xml': { headers: { 'content-type': 'application/xml' } }
  }
})

// ✅ New approach
export default defineNuxtConfig({
  i18n: {
    excludePatterns: ['/sitemap*.xml']
  }
})
```

The new approach is more reliable and works at multiple levels of the routing system.
