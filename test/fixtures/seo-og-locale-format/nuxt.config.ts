import MyModule from "../../../src/module";

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: "2024-08-16",
  i18n: {
    locales: [
      { code: "en", iso: "en-US", og: "en_US", displayName: "English" },
      { code: "ar", iso: "ar-AE", og: "ar_AE", dir: "rtl", displayName: "Arabic" },
    ],
    meta: true,
    defaultLocale: "en",
    localeCookie: "user-locale",
    translationDir: "locales",
    autoDetectLanguage: false,
    strategy: "prefix",
  },
});
