import{$ as e,Ot as t,X as n,at as r,bt as i,et as a,gt as o,it as s,nt as c,o as l,rt as u}from"./chunks/framework.CTZrU_RR.js";var d=JSON.parse(`{"title":"Getting Started with Nuxt I18n Micro","description":"Install and configure Nuxt I18n Micro.","frontmatter":{"title":"Getting Started with Nuxt I18n Micro","description":"Install and configure Nuxt I18n Micro.","outline":"deep"},"headers":[],"relativePath":"guide/getting-started.md","filePath":"guide/getting-started.md","lastUpdated":1785438557000}`),f={name:`guide/getting-started.md`},p={class:`info custom-block`};function m(l,d,f,m,h,g){let _=i(`Mermaid`),v=i(`VpFolderTree`);return o(),c(`div`,null,[d[4]||=u("",5),(o(),a(n,null,{default:t(()=>[r(_,{id:`mermaid-13`,class:`mermaid-chart`,graph:`flowchart%20LR%0A%20%20%20%20subgraph%20Core%5B%22%F0%9F%8C%90%20Nuxt%20I18n%20Micro%22%5D%0A%20%20%20%20%20%20%20%20direction%20TB%0A%20%20%20%20%20%20%20%20T%5BTranslations%5D%0A%20%20%20%20%20%20%20%20R%5BRouting%5D%0A%20%20%20%20%20%20%20%20P%5BPerformance%5D%0A%20%20%20%20%20%20%20%20S%5BSEO%5D%0A%20%20%20%20%20%20%20%20D%5BDevTools%5D%0A%20%20%20%20end%0A%0A%20%20%20%20T%20--%3E%20T1%5BGlobal%5D%0A%20%20%20%20T%20--%3E%20T2%5BPage-specific%5D%0A%20%20%20%20T%20--%3E%20T3%5BComponent%5D%0A%20%20%20%20T%20--%3E%20T4%5BFallback%5D%0A%0A%20%20%20%20R%20--%3E%20R1%5Bprefix%5D%0A%20%20%20%20R%20--%3E%20R2%5Bno_prefix%5D%0A%20%20%20%20R%20--%3E%20R3%5Bprefix_except_default%5D%0A%0A%20%20%20%20P%20--%3E%20P1%5BLazy%20loading%5D%0A%20%20%20%20P%20--%3E%20P2%5BCaching%5D%0A%20%20%20%20P%20--%3E%20P3%5BSSR%20optimized%5D%0A%0A%20%20%20%20S%20--%3E%20S1%5Bhreflang%5D%0A%20%20%20%20S%20--%3E%20S2%5BCanonical%5D%0A%20%20%20%20S%20--%3E%20S3%5BOpen%20Graph%5D%0A%0A%20%20%20%20D%20--%3E%20D1%5BHMR%5D%0A%20%20%20%20D%20--%3E%20D2%5BTypeScript%5D%0A%20%20%20%20D%20--%3E%20D3%5BCLI%5D%0A`})]),fallback:t(()=>[...d[0]||=[s(` Loading... `,-1)]]),_:1})),d[5]||=u("",12),r(v,{data:[{name:`my-nuxt-app`,isFolder:!0,children:[{name:`nuxt.config.ts`,isFolder:!1,description:`module config`,highlight:!0,preview:`export default defineNuxtConfig({
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
})`},{name:`package.json`,isFolder:!1,preview:`{
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
}`},{name:`pages`,isFolder:!0,children:[{name:`index.vue`,isFolder:!1,description:`home page`,preview:`<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
    <p>{{ $t('description') }}</p>
  </div>
</template>`},{name:`about.vue`,isFolder:!1,description:`about page`,preview:`<template>
  <div>
    <h1>{{ $t('title') }}</h1>
    <p>{{ $t('content') }}</p>
  </div>
</template>`},{name:`articles`,isFolder:!0,children:[{name:`[id].vue`,isFolder:!1,preview:`<template>
  <div>
    <h1>{{ $t('article_title') }}</h1>
  </div>
</template>

<script setup>
const route = useRoute()
const id = route.params.id
<\/script>`}],description:`dynamic route`}],description:`your Nuxt pages`},{name:`components`,isFolder:!0,children:[{name:`Header.vue`,isFolder:!1,preview:`<template>
  <nav>
    <i18n-link :to="{ name: 'index' }">
      {{ $t('menu.home') }}
    </i18n-link>
    <i18n-link :to="{ name: 'about' }">
      {{ $t('menu.about') }}
    </i18n-link>
    <i18n-switcher />
  </nav>
</template>`},{name:`Footer.vue`,isFolder:!1,preview:`<template>
  <footer>
    <p>{{ $t('footer.copyright') }}</p>
  </footer>
</template>`}]},{name:`locales`,isFolder:!0,children:[{name:`en.json`,isFolder:!1,description:`root-level translations (shared across all pages)`,preview:`{
  "menu": {
    "home": "Home",
    "about": "About Us"
  },
  "footer": {
    "copyright": "© 2025 My App"
  }
}`},{name:`fr.json`,isFolder:!1,description:`root-level translations (shared across all pages)`,preview:`{
  "menu": {
    "home": "Accueil",
    "about": "À propos"
  },
  "footer": {
    "copyright": "© 2025 Mon App"
  }
}`},{name:`ar.json`,isFolder:!1,description:`root-level translations (shared across all pages)`,preview:`{
  "menu": {
    "home": "الرئيسية",
    "about": "من نحن"
  },
  "footer": {
    "copyright": "© 2025 تطبيقي"
  }
}`},{name:`pages`,isFolder:!0,children:[{name:`index`,isFolder:!0,children:[{name:`en.json`,isFolder:!1,preview:`{
  "welcome": "Welcome to My App",
  "description": "A fast Nuxt application with i18n support."
}`},{name:`fr.json`,isFolder:!1,preview:`{
  "welcome": "Bienvenue sur Mon App",
  "description": "Une application Nuxt rapide avec support i18n."
}`},{name:`ar.json`,isFolder:!1,preview:`{
  "welcome": "مرحباً بك في تطبيقي",
  "description": "تطبيق Nuxt سريع مع دعم الترجمة."
}`}],note:`matches pages/index.vue`},{name:`about`,isFolder:!0,children:[{name:`en.json`,isFolder:!1,preview:`{
  "title": "About Us",
  "content": "Learn more about our mission."
}`},{name:`fr.json`,isFolder:!1,preview:`{
  "title": "À propos",
  "content": "En savoir plus sur notre mission."
}`},{name:`ar.json`,isFolder:!1,preview:`{
  "title": "من نحن",
  "content": "تعرف على مهمتنا."
}`}],note:`matches pages/about.vue`},{name:`articles-id`,isFolder:!0,children:[{name:`en.json`,isFolder:!1,preview:`{
  "article_title": "Article Details"
}`},{name:`fr.json`,isFolder:!1,preview:`{
  "article_title": "Détails de l'article"
}`},{name:`ar.json`,isFolder:!1,preview:`{
  "article_title": "تفاصيل المقال"
}`}],note:`matches pages/articles/[id].vue`}],description:`page-specific translations`}],description:`translation files`,highlight:!0},{name:`server`,isFolder:!0,children:[{name:`api`,isFolder:!0,children:[{name:`example.ts`,isFolder:!1,preview:`export default defineEventHandler((event) => {
  return { hello: 'world' }
})`}]},{name:`tsconfig.json`,isFolder:!1,preview:`{
  "extends": "../.nuxt/tsconfig.server.json"
}`}],open:!1}],description:`Nuxt project with i18n-micro`}],"default-open":!0,"show-toolbar":!0,"show-badges":!0,interactive:!0}),d[6]||=u("",1),e(`div`,p,[d[1]||=u("",3),r(v,{data:[{name:`my-project`,isFolder:!0,children:[{name:`app`,isFolder:!0,children:[{name:`pages`,isFolder:!0,children:[{name:`index.vue`,isFolder:!1}]}]},{name:`locales`,isFolder:!0,children:[{name:`en.json`,isFolder:!1},{name:`pages`,isFolder:!0,children:[]}]},{name:`nuxt.config.ts`,isFolder:!1}]}],"default-open":!0,"show-toolbar":!0,"show-badges":!0,interactive:!0}),d[2]||=u("",2)]),d[7]||=u("",12),(o(),a(n,null,{default:t(()=>[r(_,{id:`mermaid-212`,class:`mermaid-chart`,graph:`flowchart%20TB%0A%20%20%20%20subgraph%20Client%5B%22%F0%9F%96%A5%EF%B8%8F%20Client%20Side%22%5D%0A%20%20%20%20%20%20%20%20A%5BPage%20Request%5D%20--%3E%20D%7BTranslationStorage%20cache%3F%7D%0A%20%20%20%20%20%20%20%20D%20--%3E%7CHit%7C%20E%5BReturn%20Cached%5D%0A%20%20%20%20%20%20%20%20D%20--%3E%7CMiss%7C%20F%5B%22%24fetch%20%2F_locales%2F...%22%5D%0A%20%20%20%20%20%20%20%20F%20--%3E%20G%5BStore%20in%20TranslationStorage%5D%0A%20%20%20%20%20%20%20%20G%20--%3E%20E%0A%20%20%20%20%20%20%20%20E%20--%3E%20H%5BNuxtI18n%20view%20layer%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Server%5B%22%F0%9F%96%A7%20Server%20Side%22%5D%0A%20%20%20%20%20%20%20%20I%5BSSR%20Request%5D%20--%3E%20J%7BServer%20process%20cache%3F%7D%0A%20%20%20%20%20%20%20%20J%20--%3E%7CHit%7C%20K%5BReturn%20Cached%5D%0A%20%20%20%20%20%20%20%20J%20--%3E%7CMiss%7C%20L%5BloadTranslationsFromServer%5D%0A%20%20%20%20%20%20%20%20L%20--%3E%20M%5B%22Load%20payload%20(premerged%20file%20or%20source%20%2B%20runtime%20merge)%22%5D%0A%20%20%20%20%20%20%20%20M%20--%3E%20N%5BCache%20in%20process-global%20Map%5D%0A%20%20%20%20%20%20%20%20N%20--%3E%20K%0A%20%20%20%20%20%20%20%20K%20--%3E%20O%5BRender%20HTML%20%E2%80%94%20dictionaries%20stay%20in%20memory%2C%20not%20in%20payload%5D%0A%20%20%20%20end%0A%0A%20%20%20%20A%20-.-%3E%7CSSR%7C%20I%0A%20%20%20%20H%20--%3E%20P%5BRender%20Page%5D%0A`})]),fallback:t(()=>[...d[3]||=[s(` Loading... `,-1)]]),_:1})),d[8]||=u("",11)])}var h=l(f,[[`render`,m]]);export{d as __pageData,h as default};