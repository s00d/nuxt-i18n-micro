import MyModule from "../../../src/module";

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: "2024-08-16",
  nitro: {
    plugins: ["~/server/plugins/security-header.ts"],
  },
  i18n: {
    locales: [
      { code: "en", iso: "en_EN" },
      { code: "de", iso: "de_DE" },
    ],
    defaultLocale: "en",
    strategy: "prefix",
    translationDir: "locales",
    autoDetectLanguage: false,
  },
});
