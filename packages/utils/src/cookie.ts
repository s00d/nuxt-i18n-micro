import type { ModuleOptionsExtend } from "@i18n-micro/types";

export const DEFAULT_COOKIE_NAME = "user-locale";
export const DEFAULT_HASH_COOKIE_NAME = "hash-locale";
export const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function getLocaleCookieName(config: ModuleOptionsExtend): string | null {
  if (config.localeCookie === null) return null;
  return config.localeCookie || DEFAULT_COOKIE_NAME;
}

export function getHashCookieName(config: ModuleOptionsExtend): string | null {
  if (!config.hashMode) return null;
  return DEFAULT_HASH_COOKIE_NAME;
}

export function getLocaleCookieOptions() {
  const date = new Date();
  date.setTime(date.getTime() + DEFAULT_COOKIE_MAX_AGE * 1000);

  return {
    expires: date,
    maxAge: DEFAULT_COOKIE_MAX_AGE,
    path: "/",
    watch: true,
    sameSite: "lax" as const,
  };
}
