export default defineNuxtPlugin((nuxtApp) => {
  const hookableNuxtApp = nuxtApp as {
    hook: (
      name: "i18n:register",
      callback: (
        register: (translations: unknown, locale?: string) => void,
        locale: string,
      ) => void,
    ) => void;
  };

  hookableNuxtApp.hook(
    "i18n:register",
    async (register: (translations: unknown, locale?: string) => void, locale: string) => {
      console.log("i18n:register", locale);
      register(
        {
          hook: "hook value",
        },
        locale,
      );
    },
  );
});
