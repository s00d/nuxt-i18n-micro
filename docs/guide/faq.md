---
outline: deep
---

# FAQ: Common Issues & Solutions

## ❓ What if a route doesn't load?

One common issue when using `Nuxt I18n Micro` is that some routes might not open as expected. This can happen when the router doesn’t automatically assign a name to a route, particularly in subfolders.

### **Solution:**
To fix this, manually define the page’s route name by adding the following to the corresponding Vue file:

```javascript
definePageMeta({ name: 'pageName' })
```

This ensures that the route is properly registered, and the application can navigate to it without issues.

---

## ❓ Why is the `assets/_locales/` folder added to the server folder?

When deploying to platforms like Netlify, the build process might behave differently compared to local development. This can lead to issues where certain files or folders are not found during server-side rendering (SSR).

### **Solution:**
To ensure that localization files are available during SSR, the `assets/_locales/` folder is added to the server folder. This is a workaround to make sure that the localization files are accessible in the production environment, especially when the build process and runtime environment differ.

### **Explanation:**
- **Build Process:** During the build, all translations are cached in the production folder. However, when deploying to platforms like Netlify, the server code is moved to functions, and there might be a separate container where locale files are not accessible.
- **Prerendering:** Prerendering does not work when using `$fetch` in SSR, leading to middleware not finding the localization files.
- **Server Assets:** To address this, the localization files are saved in the Nitro server assets during prerendering. In production, they are read from the server assets.

---
