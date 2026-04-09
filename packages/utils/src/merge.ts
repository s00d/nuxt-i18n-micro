export function deepMergeTranslations(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  if (!target || Object.keys(target).length === 0) return { ...source };
  const output = { ...target };
  for (const key in source) {
    if (key === "__proto__" || key === "constructor") continue;
    const src = source[key];
    const dst = output[key];
    if (
      src &&
      typeof src === "object" &&
      !Array.isArray(src) &&
      dst &&
      typeof dst === "object" &&
      !Array.isArray(dst)
    ) {
      output[key] = deepMergeTranslations(
        dst as Record<string, unknown>,
        src as Record<string, unknown>,
      );
    } else {
      output[key] = src;
    }
  }
  return output;
}

export function normalizeApiBasePath(rawUrl: string): string {
  return rawUrl.replace(/^\/+|\/+$/g, "").replace(/\/{2,}/g, "/");
}
