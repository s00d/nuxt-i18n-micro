import{_ as d}from"./chunks/plugin-vue_export-helper.DlAUqK2U.js";import{A as r,b as c,k as l,d as i,e as o,ah as e,g as t,l as a,m as n,ai as k}from"./chunks/chartjs.CT3i_C7A.js";const v=JSON.parse('{"title":"🌐 Getting Started with Nuxt I18n Micro","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"guide/getting-started.md","filePath":"guide/getting-started.md","lastUpdated":1771313141000}'),g={name:"guide/getting-started.md"};function E(y,s,u,F,m,b){const h=r("Mermaid"),p=r("VpFolderTree");return l(),c("div",null,[s[2]||(s[2]=i("h1",{id:"🌐-getting-started-with-nuxt-i18n-micro",tabindex:"-1"},[a("🌐 Getting Started with Nuxt I18n Micro "),i("a",{class:"header-anchor",href:"#🌐-getting-started-with-nuxt-i18n-micro","aria-label":'Permalink to "🌐 Getting Started with Nuxt I18n Micro"'},"​")],-1)),s[3]||(s[3]=i("p",null,"Welcome to Nuxt I18n Micro! This guide will help you get up and running with our high-performance internationalization module for Nuxt.js.",-1)),s[4]||(s[4]=i("h2",{id:"📖-overview",tabindex:"-1"},[a("📖 Overview "),i("a",{class:"header-anchor",href:"#📖-overview","aria-label":'Permalink to "📖 Overview"'},"​")],-1)),s[5]||(s[5]=i("p",null,[i("code",null,"Nuxt I18n Micro"),a(" is a lightweight internationalization module for Nuxt that delivers superior performance compared to traditional solutions. It's designed to reduce build times, memory usage, and server load, making it ideal for high-traffic and large projects.")],-1)),(l(),o(k,null,{default:n(()=>[t(h,{id:"mermaid-12",class:"mermaid-chart",graph:"flowchart%20LR%0A%20%20%20%20subgraph%20Core%5B%22%F0%9F%8C%90%20Nuxt%20I18n%20Micro%22%5D%0A%20%20%20%20%20%20%20%20direction%20TB%0A%20%20%20%20%20%20%20%20T%5BTranslations%5D%0A%20%20%20%20%20%20%20%20R%5BRouting%5D%0A%20%20%20%20%20%20%20%20P%5BPerformance%5D%0A%20%20%20%20%20%20%20%20S%5BSEO%5D%0A%20%20%20%20%20%20%20%20D%5BDevTools%5D%0A%20%20%20%20end%0A%20%20%20%20%0A%20%20%20%20T%20--%3E%20T1%5BGlobal%5D%0A%20%20%20%20T%20--%3E%20T2%5BPage-specific%5D%0A%20%20%20%20T%20--%3E%20T3%5BComponent%5D%0A%20%20%20%20T%20--%3E%20T4%5BFallback%5D%0A%20%20%20%20%0A%20%20%20%20R%20--%3E%20R1%5Bprefix%5D%0A%20%20%20%20R%20--%3E%20R2%5Bno_prefix%5D%0A%20%20%20%20R%20--%3E%20R3%5Bprefix_except_default%5D%0A%20%20%20%20%0A%20%20%20%20P%20--%3E%20P1%5BLazy%20loading%5D%0A%20%20%20%20P%20--%3E%20P2%5BCaching%5D%0A%20%20%20%20P%20--%3E%20P3%5BSSR%20optimized%5D%0A%20%20%20%20%0A%20%20%20%20S%20--%3E%20S1%5Bhreflang%5D%0A%20%20%20%20S%20--%3E%20S2%5BCanonical%5D%0A%20%20%20%20S%20--%3E%20S3%5BOpen%20Graph%5D%0A%20%20%20%20%0A%20%20%20%20D%20--%3E%20D1%5BHMR%5D%0A%20%20%20%20D%20--%3E%20D2%5BTypeScript%5D%0A%20%20%20%20D%20--%3E%20D3%5BCLI%5D%0A"})]),fallback:n(()=>[...s[0]||(s[0]=[a(" Loading... ",-1)])]),_:1})),s[6]||(s[6]=e("",12)),t(p,{data:[{name:"my-nuxt-app",isFolder:!0,children:[{name:"nuxt.config.ts",isFolder:!1,description:"module config",highlight:!0,preview:`export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'ar', iso: 'ar-SA', dir: 'rtl' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
  },
})`},{name:"package.json",isFolder:!1,preview:`{
  "name": "my-nuxt-app",
  "private": true,
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate"
  },
  "dependencies": {
    "nuxt": "^3.x",
    "nuxt-i18n-micro": "^3.x"
  }
}`},{name:"pages",isFolder:!0,children:[{name:"index.vue",isFolder:!1,description:"home page",preview:`<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
    <p>{{ $t('description') }}</p>
  </div>
</template>`},{name:"about.vue",isFolder:!1,description:"about page",preview:`<template>
  <div>
    <h1>{{ $t('title') }}</h1>
    <p>{{ $t('content') }}</p>
  </div>
</template>`},{name:"articles",isFolder:!0,children:[{name:"[id].vue",isFolder:!1,preview:`<template>
  <div>
    <h1>{{ $t('article_title') }}</h1>
  </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id
<\/script>`}],description:"dynamic route"}],description:"your Nuxt pages"},{name:"components",isFolder:!0,children:[{name:"Header.vue",isFolder:!1,preview:`<template>
  <nav>
    <i18n-link :to="{ name: 'index' }">
      {{ $t('menu.home') }}
    </i18n-link>
    <i18n-link :to="{ name: 'about' }">
      {{ $t('menu.about') }}
    </i18n-link>
    <i18n-switcher />
  </nav>
</template>`},{name:"Footer.vue",isFolder:!1,preview:`<template>
  <footer>
    <p>{{ $t('footer.copyright') }}</p>
  </footer>
</template>`}]},{name:"locales",isFolder:!0,children:[{name:"en.json",isFolder:!1,description:"root-level translations (shared across all pages)",preview:`{
  "menu": {
    "home": "Home",
    "about": "About Us"
  },
  "footer": {
    "copyright": "© 2025 My App"
  }
}`},{name:"fr.json",isFolder:!1,description:"root-level translations (shared across all pages)",preview:`{
  "menu": {
    "home": "Accueil",
    "about": "À propos"
  },
  "footer": {
    "copyright": "© 2025 Mon App"
  }
}`},{name:"ar.json",isFolder:!1,description:"root-level translations (shared across all pages)",preview:`{
  "menu": {
    "home": "الرئيسية",
    "about": "من نحن"
  },
  "footer": {
    "copyright": "© 2025 تطبيقي"
  }
}`},{name:"pages",isFolder:!0,children:[{name:"index",isFolder:!0,children:[{name:"en.json",isFolder:!1,preview:`{
  "welcome": "Welcome to My App",
  "description": "A fast Nuxt application with i18n support."
}`},{name:"fr.json",isFolder:!1,preview:`{
  "welcome": "Bienvenue sur Mon App",
  "description": "Une application Nuxt rapide avec support i18n."
}`},{name:"ar.json",isFolder:!1,preview:`{
  "welcome": "مرحباً بك في تطبيقي",
  "description": "تطبيق Nuxt سريع مع دعم الترجمة."
}`}],note:"matches pages/index.vue"},{name:"about",isFolder:!0,children:[{name:"en.json",isFolder:!1,preview:`{
  "title": "About Us",
  "content": "Learn more about our mission."
}`},{name:"fr.json",isFolder:!1,preview:`{
  "title": "À propos",
  "content": "En savoir plus sur notre mission."
}`},{name:"ar.json",isFolder:!1,preview:`{
  "title": "من نحن",
  "content": "تعرف على مهمتنا."
}`}],note:"matches pages/about.vue"},{name:"articles-id",isFolder:!0,children:[{name:"en.json",isFolder:!1,preview:`{
  "article_title": "Article Details"
}`},{name:"fr.json",isFolder:!1,preview:`{
  "article_title": "Détails de l'article"
}`},{name:"ar.json",isFolder:!1,preview:`{
  "article_title": "تفاصيل المقال"
}`}],note:"matches pages/articles/[id].vue"}],description:"page-specific translations"}],description:"translation files",highlight:!0},{name:"server",isFolder:!0,children:[{name:"api",isFolder:!0,children:[{name:"example.ts",isFolder:!1,preview:`export default defineEventHandler((event) => {
  return { hello: 'world' }
})`}]},{name:"tsconfig.json",isFolder:!1,preview:`{
  "extends": "../.nuxt/tsconfig.server.json"
}`}],open:!1}],description:"Nuxt project with i18n-micro"}],"default-open":!0,"show-toolbar":!0,"show-badges":!0,interactive:!0}),s[7]||(s[7]=e("",42)),t(p,{data:[{name:"locales",isFolder:!0,children:[{name:"en.json",isFolder:!1},{name:"fr.json",isFolder:!1},{name:"ar.json",isFolder:!1}]}],"default-open":!0,"show-toolbar":!0,"show-badges":!0,interactive:!0}),s[8]||(s[8]=e("",162)),(l(),o(k,null,{default:n(()=>[t(h,{id:"mermaid-908",class:"mermaid-chart",graph:"flowchart%20TB%0A%20%20%20%20subgraph%20Client%5B%22%F0%9F%96%A5%EF%B8%8F%20Client%20Side%22%5D%0A%20%20%20%20%20%20%20%20A%5BPage%20Request%5D%20--%3E%20B%7Bwindow.__I18N__%3F%7D%0A%20%20%20%20%20%20%20%20B%20--%3E%7CFound%7C%20C%5BUse%20SSR%20Data%5D%0A%20%20%20%20%20%20%20%20B%20--%3E%7CNot%20Found%7C%20D%7BTranslationStorage%20cache%3F%7D%0A%20%20%20%20%20%20%20%20D%20--%3E%7CHit%7C%20E%5BReturn%20Cached%5D%0A%20%20%20%20%20%20%20%20D%20--%3E%7CMiss%7C%20F%5B%22%24fetch%20%2F_locales%2F...%22%5D%0A%20%20%20%20%20%20%20%20F%20--%3E%20G%5BStore%20in%20TranslationStorage%5D%0A%20%20%20%20%20%20%20%20G%20--%3E%20E%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Server%5B%22%F0%9F%96%A7%20Server%20Side%22%5D%0A%20%20%20%20%20%20%20%20H%5BSSR%20Request%5D%20--%3E%20I%7BServer%20process%20cache%3F%7D%0A%20%20%20%20%20%20%20%20I%20--%3E%7CHit%7C%20J%5BReturn%20Cached%5D%0A%20%20%20%20%20%20%20%20I%20--%3E%7CMiss%7C%20K%5BloadTranslationsFromServer%5D%0A%20%20%20%20%20%20%20%20K%20--%3E%20L%5B%22Read%20pre-built%20file%20(root%20%2B%20page%20%2B%20fallback%20already%20merged)%22%5D%0A%20%20%20%20%20%20%20%20L%20--%3E%20M%5BCache%20in%20process-global%20Map%5D%0A%20%20%20%20%20%20%20%20M%20--%3E%20J%0A%20%20%20%20%20%20%20%20J%20--%3E%20N%5B%22Inject%20window.__I18N__%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20A%20-.-%3E%7CFirst%20Load%7C%20H%0A%20%20%20%20N%20-.-%3E%7CHydration%7C%20B%0A%20%20%20%20E%20--%3E%20O%5BRender%20Page%5D%0A%20%20%20%20C%20--%3E%20O%0A"})]),fallback:n(()=>[...s[1]||(s[1]=[a(" Loading... ",-1)])]),_:1})),s[9]||(s[9]=e("",11))])}const B=d(g,[["render",E]]);export{v as __pageData,B as default};
