---
name: 🐛 Bug Report
about: Report a bug or unexpected behavior
title: '[Bug]: '
labels: 'bug, needs-triage'
assignees: ''
---

## 🔗 Reproduction

<!-- 
⚠️ REQUIRED: Provide a minimal reproduction repository
Issues without reproduction may be closed.

Create one using:
- StackBlitz: https://nuxt.new
- GitHub Repository
- CodeSandbox: https://codesandbox.io/s/nuxt
-->

**Repository URL:**  
<!-- Replace with your link -->


## 📝 Description

### What's happening?
<!-- Describe the bug clearly -->


### What should happen?
<!-- Describe expected behavior -->


## 🔄 Steps to Reproduce

1. 
2. 
3. 
4. 

## 💻 Environment

- **OS**: [e.g., macOS 14, Windows 11, Ubuntu 22.04]
- **Node**: [e.g., 20.10.0] <!-- Run: node -v -->
- **Nuxt**: [e.g., 3.13.0]
- **nuxt-i18n-micro**: [e.g., 1.102.0]
- **Browser**: [e.g., Chrome 120] (if applicable)

### Deployment (if applicable)

- **Platform**: [e.g., Vercel, Netlify, Firebase]
- **Preset**: [e.g., node-server, vercel, firebase]

## ⚙️ Configuration

<details>
<summary>nuxt.config.ts</summary>

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    // Your config here
  }
})
```

</details>

## 📊 Logs

<details>
<summary>Console/Build Errors (if any)</summary>

```
Paste errors here
```

</details>

## ✅ Checklist

- [ ] I provided a **reproduction repository**
- [ ] I checked the [documentation](https://s00d.github.io/nuxt-i18n-micro/)
- [ ] I searched [existing issues](https://github.com/s00d/nuxt-i18n-micro/issues)
- [ ] I checked the [FAQ](https://s00d.github.io/nuxt-i18n-micro/guide/faq)
- [ ] I tried the latest version

---

💡 **Common issues:**
- **Translations not working after deploy?** → See [Firebase Guide](https://s00d.github.io/nuxt-i18n-micro/guide/firebase)
- **Build errors?** → Run `pnpm dev:prepare`
