import { CacheControl, type CacheControlOptions } from "@i18n-micro/utils";

declare global {
  interface Window {
    __I18N__?: Record<string, unknown>;
  }
}

export interface LoadOptions {
  apiBaseUrl: string;
  baseURL: string;
  dateBuild?: string | number;
}

export interface LoadResult {
  data: Record<string, unknown>;
  cacheKey: string;
  json?: string;
}

const CC_KEY = Symbol.for("__NUXT_I18N_STORAGE_CC__");
type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown };

function getStorageCacheControl(): CacheControl<Record<string, unknown>> {
  const g = globalThis as GlobalWithCC;
  if (!g[CC_KEY]) g[CC_KEY] = new CacheControl<Record<string, unknown>>();
  return g[CC_KEY] as CacheControl<Record<string, unknown>>;
}

class TranslationStorage {
  private cc: CacheControl<Record<string, unknown>>;

  constructor() {
    this.cc = getStorageCacheControl();
  }

  configure(options: CacheControlOptions): void {
    this.cc.configure(options);
  }

  private getCacheKey(locale: string, routeName?: string): string {
    return `${locale}:${routeName || "index"}`;
  }

  private async fetchTranslations(
    locale: string,
    routeName: string | undefined,
    options: LoadOptions,
  ): Promise<Record<string, unknown>> {
    const { apiBaseUrl, baseURL, dateBuild } = options;
    const page = routeName || "index";
    const path = `/${apiBaseUrl}/${page}/${locale}/data.json`;

    return (await $fetch(path.replace(/\/{2,}/g, "/"), {
      baseURL,
      params: dateBuild ? { v: dateBuild } : undefined,
    })) as Record<string, unknown>;
  }

  getFromCache(locale: string, routeName?: string): LoadResult | null {
    const cacheKey = this.getCacheKey(locale, routeName);
    const cached = this.cc.get(cacheKey);
    if (cached) return { data: cached, cacheKey };

    if (import.meta.client && typeof window !== "undefined" && window.__I18N__?.[cacheKey]) {
      const data = window.__I18N__[cacheKey] as Record<string, unknown>;
      delete window.__I18N__[cacheKey];
      this.cc.set(cacheKey, Object.freeze(data));
      return { data: this.cc.get(cacheKey)!, cacheKey };
    }

    return null;
  }

  async load(locale: string, routeName: string | undefined, options: LoadOptions): Promise<LoadResult> {
    const cached = this.getFromCache(locale, routeName);
    if (cached) return cached;

    const cacheKey = this.getCacheKey(locale, routeName);
    const data = await this.fetchTranslations(locale, routeName, options);
    this.cc.set(cacheKey, Object.freeze(data));
    const json = import.meta.server ? JSON.stringify(data).replace(/</g, "\\u003c") : undefined;
    return { data: this.cc.get(cacheKey)!, cacheKey, json };
  }

  clear(): void {
    this.cc.clear();
  }
}

export const translationStorage = new TranslationStorage();
