import { describe, expect, it } from "vitest";
import { deepMergeTranslations, normalizeApiBasePath, resolveLocales } from "../src";

describe("@i18n-micro/utils locales helpers", () => {
  it("merges duplicate locale entries and skips disabled", () => {
    const result = resolveLocales(
      [
        { code: "en", displayName: "English" },
        { code: "en", iso: "en_US" },
        { code: "de", disabled: true },
      ] as any,
      "en",
    );

    expect(result.locales).toEqual([{ code: "en", displayName: "English", iso: "en_US" }]);
    expect(result.defaultLocale.code).toBe("en");
  });
});

describe("@i18n-micro/utils merge helpers", () => {
  it("deep merges objects and protects from proto keys", () => {
    const target = { a: { one: 1 }, safe: true };
    const source = JSON.parse('{"a":{"two":2},"b":3,"__proto__":{"polluted":true}}') as Record<
      string,
      unknown
    >;

    const merged = deepMergeTranslations(target, source);
    expect(merged).toEqual({ a: { one: 1, two: 2 }, safe: true, b: 3 });
    expect(Object.prototype.hasOwnProperty.call(merged, "__proto__")).toBe(false);
    expect(({} as any).polluted).toBeUndefined();
  });

  it("normalizes api base path safely", () => {
    expect(normalizeApiBasePath("//_locales///v1//")).toBe("_locales/v1");
  });
});
