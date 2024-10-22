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
