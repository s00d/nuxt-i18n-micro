import MyModule from "../../../src/module";

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  experimental: {
    appManifest: false,
  },
  compatibilityDate: "2024-08-16",
  i18n: {
    locales: [
      { code: "en", iso: "en_EN" },
      { code: "de", iso: "de_DE" },
    ],
    meta: true,
    defaultLocale: "en",
    strategy: "prefix",
    autoDetectLanguage: false,
    translationDir: "locales",
  },
});
