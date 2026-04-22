import { describe, expect, it } from "vitest";
import {
  buildFullPath,
  filterQueryByWhitelist,
  getLocaleFromPath,
  getPathWithoutLocale,
  joinURL,
  joinUrl,
  normalizePath,
  normalizePathForCompare,
  normalizeRoutePath,
  parseAcceptLanguage,
  withLeadingSlash,
} from "../src";

describe("@i18n-micro/utils query helpers", () => {
  it("keeps only whitelisted query keys in declared order", () => {
    const output = filterQueryByWhitelist("/en/contact?q=hello&page=2&foo=ignore", ["page", "q"]);
    expect(output).toBe("/en/contact?page=2&q=hello");
  });

  it("supports absolute URLs for query filtering", () => {
    const output = filterQueryByWhitelist("https://example.com/en?a=1&b=2", ["b"]);
    expect(output).toBe("/en?b=2");
  });

  it("parses Accept-Language by quality weights", () => {
    const parsed = parseAcceptLanguage("fr;q=0.2,en-US;q=0.9,en;q=0.8,de");
    expect(parsed).toEqual(["de", "en-US", "en", "fr"]);
  });
});

describe("@i18n-micro/utils path helpers", () => {
  it("normalizes paths and comparison form", () => {
    expect(normalizePath("//en//about/")).toBe("/en/about");
    expect(normalizePathForCompare("/en/about/")).toBe("/en/about");
  });

  it("joins urls consistently", () => {
    expect(joinURL("https://example.com", "/en", "/about")).toBe("https://example.com/en/about");
    expect(joinUrl("https://example.com/", "/en/about/")).toBe("https://example.com/en/about");
    expect(joinUrl("/en/", "/about/")).toBe("/en/about");
  });

  it("builds locale matcher from RegExp source only", () => {
    expect(buildFullPath(["en", "de"], "/about", /^[a-z]{2}$/i)).toBe("/:locale(^[a-z]{2}$)/about");
  });

  it("builds locale matcher from stringified regex with flags", () => {
    expect(buildFullPath(["en", "de"], "/about", "/^[a-z]{2}$/i")).toBe(
      "/:locale(^[a-z]{2}$)/about",
    );
  });

  it("keeps root slash during route path normalization", () => {
    expect(normalizeRoutePath("/")).toBe("/");
    expect(normalizeRoutePath("///")).toBe("/");
    expect(normalizeRoutePath("/./")).toBe("/");
  });

  it("extracts and removes locale from path", () => {
    const localeCodes = ["en", "de", "ru"];
    expect(getLocaleFromPath("/de/contact", localeCodes)).toBe("de");
    expect(getLocaleFromPath("/contact", localeCodes)).toBeNull();
    expect(getPathWithoutLocale("/ru/docs/page", localeCodes)).toEqual({
      pathWithoutLocale: "/docs/page",
      localeFromPath: "ru",
    });
  });

  it("keeps root slash for empty segments", () => {
    expect(withLeadingSlash("")).toBe("/");
    const localeCodes = ["en"];
    expect(getPathWithoutLocale("/en", localeCodes)).toEqual({
      pathWithoutLocale: "/",
      localeFromPath: "en",
    });
  });
});
