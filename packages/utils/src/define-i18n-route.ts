import type { DefineI18nRouteConfig } from "@i18n-micro/types";

function extractScriptContent(content: string): string | null {
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return scriptMatch?.[1] ? scriptMatch[1] : null;
}

function removeTypeScriptTypes(scriptContent: string): string {
  return scriptContent.replace(/\((\w+):[^)]*\)/g, "($1)");
}

function findDefineI18nRouteConfig(scriptContent: string): DefineI18nRouteConfig | null {
  try {
    const defineStart = scriptContent.indexOf("$defineI18nRoute(");
    if (defineStart === -1) return null;

    const openParen = scriptContent.indexOf("(", defineStart);
    if (openParen === -1) return null;

    let braceCount = 0;
    let parenCount = 1;
    let i = openParen + 1;

    for (; i < scriptContent.length; i++) {
      if (scriptContent[i] === "{") braceCount++;
      if (scriptContent[i] === "}") braceCount--;
      if (scriptContent[i] === "(") parenCount++;
      if (scriptContent[i] === ")") {
        parenCount--;
        if (parenCount === 0 && braceCount === 0) break;
      }
    }

    if (i >= scriptContent.length) return null;
    const configStr = scriptContent.substring(openParen + 1, i);
    const cleanConfigStr = removeTypeScriptTypes(configStr);

    try {
      const configObject = Function(`"use strict";return (${cleanConfigStr})`)();
      try {
        const serialized = JSON.stringify(configObject);
        return JSON.parse(serialized);
      } catch {
        return configObject;
      }
    } catch {
      const scriptWithoutImports = scriptContent
        .split("\n")
        .filter((line) => !line.trim().startsWith("import "))
        .join("\n");

      const cleanScript = removeTypeScriptTypes(scriptWithoutImports);
      const safeScript = `
        const $defineI18nRoute = () => {}
        const defineI18nRoute = () => {}
        const process = { env: { NODE_ENV: 'development' } }
        ${cleanScript}
        return (${cleanConfigStr})
      `;

      const configObject = Function(`"use strict";${safeScript}`)();
      try {
        const serialized = JSON.stringify(configObject);
        return JSON.parse(serialized);
      } catch {
        return configObject;
      }
    }
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
