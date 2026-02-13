---
outline: deep
---

# 🔥 Firebase AppHosting Deployment

## 📖 Introduction

Firebase AppHosting is a powerful platform for deploying Nuxt applications with serverless infrastructure. However, when deploying applications with `nuxt-i18n-micro`, you may encounter specific issues related to how translation JSON files are served. This guide provides comprehensive solutions to ensure your translations work correctly in production.

## ⚠️ Common Issues

### Translation Files Not Applied

**Symptoms:**
- ✅ Translations work perfectly in development (`nuxt dev`)
- ❌ After deployment to Firebase AppHosting, JSON files load but translations don't apply
- ❌ No errors appear in the console
- ❌ Translation files are visible in the Network tab but have incorrect `Content-Type: text/html` instead of `application/json`

**Root Cause:**

Firebase AppHosting (and other platforms using Nitro prerendering) may serve prerendered JSON files with incorrect MIME types. When the browser receives JSON files with `Content-Type: text/html`, it cannot properly parse them, causing translations to fail silently.

## ✅ Solutions

### Solution 1: Route Rules Configuration (Recommended)

The most straightforward solution is to add explicit headers for translation routes in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'de', iso: 'de-DE', dir: 'ltr' },
      // ... other locales
    ],
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
    metaBaseUrl: 'https://your-domain.com',
  },
  
  // Add route rules for translation files
  routeRules: {
    '/_locales/**': {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    }
  }
})
```

**Benefits:**
- ✨ Simple configuration
- 🚀 Improves performance with proper caching
- 🔒 Works across all deployment platforms

### Solution 2: Custom API Base URL

If you're using a custom `apiBaseUrl` (path prefix only), adjust the route rules accordingly:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  
  i18n: {
    apiBaseUrl: '/api/translations',  // Path prefix only, not a full URL
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
    ],
    defaultLocale: 'en',
  },
  
  routeRules: {
    '/api/translations/**': {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    }
  }
})
```

### Solution 3: Firebase-Specific Configuration

Create or update your `firebase.json` file in the project root:

```json
{
  "hosting": {
    "public": ".output/public",
    "cleanUrls": true,
    "rewrites": [
      {
        "source": "**",
        "function": "server"
      }
    ],
    "headers": [
      {
        "source": "/_locales/**/*.json",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600, immutable"
          },
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": ".output/server"
  }
}
```

::: warning
Make sure the `source` pattern matches your `apiBaseUrl` configuration. If you've customized `apiBaseUrl`, update the pattern accordingly.
:::

### Solution 4: Firebase Functions Configuration

For Firebase Functions deployment, ensure your `functions/package.json` includes necessary dependencies:

```json
{
  "name": "functions",
  "type": "module",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  }
}
```

## 🔍 Debugging

### Enable Debug Mode

Add debug logging to identify issues:

```typescript
export default defineNuxtConfig({
  i18n: {
    debug: true,
    // Your other config...
  }
})
```

This will output detailed logs about:
- 📝 Translation file loading
- 🔄 Cache operations
- ⚠️ Loading errors

### Check Network Tab

1. Open DevTools → Network tab
2. Filter by "data.json"
3. Click on a translation file request
4. Verify **Response Headers**:
   - ✅ `Content-Type: application/json` (correct)
   - ❌ `Content-Type: text/html` (incorrect - needs fixing)

### Verify Prerender Output

After building, check that translation files are generated:

```bash
pnpm build

# Check prerendered translations
ls -la .output/public/_locales/index/
```

You should see JSON files for each locale.

## 🚀 Build Configuration

### Nitro Preset

For Firebase AppHosting, ensure you're using the correct preset:

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'firebase-app-hosting',
    firebase: {
      gen: 2,
      httpsOptions: {
        region: 'us-central1',
        maxInstances: 3
      }
    }
  }
})
```

### Prerender Configuration

Configure prerendering for optimal performance:

```typescript
export default defineNuxtConfig({
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      ignore: ['/api/**', '/admin/**']
    }
  }
})
```

## 📋 Complete Example Configuration

Here's a complete working configuration for Firebase AppHosting:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'de', iso: 'de-DE', dir: 'ltr' },
      { code: 'es', iso: 'es-ES', dir: 'ltr' },
      { code: 'it', iso: 'it-IT', dir: 'ltr' },
      { code: 'pt', iso: 'pt-PT', dir: 'ltr' },
      { code: 'ru', iso: 'ru-RU', dir: 'ltr' },
      { code: 'zh', iso: 'zh-CN', dir: 'ltr' },
      { code: 'ko', iso: 'ko-KR', dir: 'ltr' }
    ],
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
    metaBaseUrl: 'https://your-domain.com',
    debug: false, // Enable in development if needed
  },
  
  routeRules: {
    '/_locales/**': {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    }
  },
  
  nitro: {
    preset: 'firebase-app-hosting',
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  }
})
```

```json
// firebase.json
{
  "hosting": {
    "public": ".output/public",
    "cleanUrls": true,
    "headers": [
      {
        "source": "/_locales/**/*.json",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "server"
      }
    ]
  },
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs18"
  }
}
```

## ✅ Verification Checklist

After applying the fixes, verify everything works:

- [ ] Build completes without errors
- [ ] Translation JSON files are in `.output/public/_locales/`
- [ ] Network tab shows `Content-Type: application/json` for translation files
- [ ] Translations display correctly on first page load
- [ ] No hydration mismatches in console
- [ ] Language switching works correctly
- [ ] SEO meta tags are generated properly

## 🔄 Deployment Workflow

### 1. Prepare Build

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Verify translations are prerendered
ls -la .output/public/_locales/
```

### 2. Deploy to Firebase

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (first time only)
firebase init hosting

# Deploy
firebase deploy --only hosting,functions
```

### 3. Verify Deployment

1. Visit your deployed site
2. Open DevTools → Network tab
3. Navigate to a page
4. Check that `/_locales/index/en/data.json` (or your default locale) loads with:
   - Status: 200
   - Content-Type: application/json
   - Response contains valid JSON

## 🔧 Troubleshooting

### Issue: 404 Errors for Translation Files

**Solution:** Ensure translation files are being copied to the output directory:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    publicAssets: [
      {
        dir: 'locales',
        maxAge: 60 * 60 * 24 * 365 // 1 year
      }
    ]
  }
})
```

### Issue: Translations Work on Some Pages But Not Others

**Solution:** Check if page-specific translations are being generated:

```bash
# Should show files for each page
ls -la .output/public/_locales/index/
ls -la .output/public/_locales/about/
```

If page-specific translations are missing, ensure `disablePageLocales` is not set to `true`:

```typescript
i18n: {
  disablePageLocales: false, // Ensure this is false
}
```

### Issue: Slow Translation Loading

**Solution:** Optimize caching and preloading:

```typescript
routeRules: {
  '/_locales/**': {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff'
    },
    prerender: true
  }
}
```

## 📚 Additional Resources

- [Firebase AppHosting Documentation](https://firebase.google.com/docs/app-hosting)
- [Nitro Presets](https://nitro.unjs.io/deploy/providers/firebase)
- [Nuxt Deployment Guide](https://nuxt.com/docs/getting-started/deployment)
- [Module Configuration](/guide/getting-started#configuration-options)

## 💡 Tips

1. **Always test in production-like environment** before deploying
2. **Use debug mode** during initial setup to catch issues early
3. **Monitor cache hit rates** to optimize performance
4. **Keep translation files small** for faster loading
5. **Use proper cache headers** to reduce server load

## ⚡ Performance Optimization

### Enable Compression

Firebase automatically handles Gzip/Brotli compression, but ensure your build is optimized:

```typescript
export default defineNuxtConfig({
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }
  }
})
```

### Lazy Load Translations

`Nuxt I18n Micro` automatically lazy-loads translations on a per-page basis. Translations are only loaded when needed, reducing initial bundle size. This is built-in functionality - no additional configuration required.

To further optimize:
- Use `disablePageLocales: false` (default) to enable page-specific translations
- Keep root-level translations minimal
- Use route-specific translation files for page content

::: tip Module Version
The module automatically sets proper `Content-Type` headers starting from version **v3.0.0+**. If you're experiencing issues, update to the latest version:

```bash
pnpm update nuxt-i18n-micro@latest
```
:::

## 🎯 Next Steps

- [Server-Side Translations](/guide/server-side-translations)
- [Performance Optimization](/guide/performance)
- [SEO Configuration](/guide/seo)
- [Testing Guide](/guide/testing)

