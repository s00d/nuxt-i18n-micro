import JSON5 from "json5";
import type { DefineI18nRouteConfig } from "@i18n-micro/types";

function extractScriptContent(content: string): string | null {
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return scriptMatch?.[1] ? scriptMatch[1] : null;
}

function removeTypeScriptTypes(scriptContent: string): string {
  return scriptContent.replace(/\((\w+):[^)]*\)/g, "($1)");
}

function normalizeObjectLikeForJson5(input: string): string {
  return input
    .replace(/\[\s*(['"`])([^'"`]+)\1\s*\]\s*:/g, (_m, _q: string, key: string) => `"${key}":`);
}

function findMatchingClosingParen(input: string, openParen: number): number {
  let braceCount = 0;
  let parenCount = 1;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let i = openParen + 1; i < input.length; i++) {
    const ch = input[i];
    const prev = input[i - 1];
    const next = input[i + 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (prev === "*" && ch === "/") inBlockComment = false;
      continue;
    }
    if (inSingle) {
      if (!escaped && ch === "'") inSingle = false;
      escaped = !escaped && ch === "\\";
      continue;
    }
    if (inDouble) {
      if (!escaped && ch === '"') inDouble = false;
      escaped = !escaped && ch === "\\";
      continue;
    }
    if (inTemplate) {
      if (!escaped && ch === "`") inTemplate = false;
      escaped = !escaped && ch === "\\";
      continue;
    }

    if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      escaped = false;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      escaped = false;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      escaped = false;
      continue;
    }

    if (ch === "{") braceCount++;
    if (ch === "}") braceCount--;
    if (ch === "(") parenCount++;
    if (ch === ")") {
      parenCount--;
      if (parenCount === 0 && braceCount === 0) return i;
    }
  }

  return -1;
}

function findDefineI18nRouteConfig(scriptContent: string): DefineI18nRouteConfig | null {
  try {
    const defineStart = scriptContent.indexOf("$defineI18nRoute(");
    if (defineStart === -1) return null;

    const openParen = scriptContent.indexOf("(", defineStart);
    if (openParen === -1) return null;

    const closeParen = findMatchingClosingParen(scriptContent, openParen);
    if (closeParen === -1) return null;
    const configStr = scriptContent.substring(openParen + 1, closeParen);
    const cleanConfigStr = normalizeObjectLikeForJson5(removeTypeScriptTypes(configStr));
    const parsed = JSON5.parse(cleanConfigStr) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as DefineI18nRouteConfig;
  } catch {
    return null;
  }
}

export function extractDefineI18nRouteData(
  content: string,
  _filePath: string,
): DefineI18nRouteConfig | null {
  try {
    const scriptContent = extractScriptContent(content);
    if (!scriptContent) return null;

    const configObject = findDefineI18nRouteConfig(scriptContent);
    if (!configObject) return null;

    if (
      configObject.locales &&
      typeof configObject.locales === "object" &&
      !Array.isArray(configObject.locales)
    ) {
      const localesObj = configObject.locales as Record<string, Record<string, unknown> & { path?: string }>;
      const normalizedLocales: string[] = [];
      const normalizedLocaleRoutes: Record<string, string> = {};

      for (const [locale, value] of Object.entries(localesObj)) {
        normalizedLocales.push(locale);
        if (value && typeof value === "object" && "path" in value && typeof value.path === "string") {
          normalizedLocaleRoutes[locale] = value.path;
        }
      }

      return {
        ...configObject,
        locales: normalizedLocales,
        localeRoutes:
          configObject.localeRoutes || Object.keys(normalizedLocaleRoutes).length > 0
            ? { ...configObject.localeRoutes, ...normalizedLocaleRoutes }
            : undefined,
      };
    }

    if (
      Array.isArray(configObject.locales) &&
      configObject.locales.length > 0 &&
      typeof configObject.locales[0] === "object"
    ) {
      const normalizedLocales: string[] = configObject.locales.map((item: unknown) => {
        if (item && typeof item === "object" && "code" in item) return (item as { code: string }).code;
        return String(item);
      });
      return { ...configObject, locales: normalizedLocales };
    }

    return configObject;
  } catch {
    return null;
  }
}
