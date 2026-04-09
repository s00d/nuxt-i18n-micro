import { describe, expect, it } from "vitest";
import {
  buildFullPathNoPrefix,
  buildRouteName,
  buildRouteNameFromRoute,
  buildUrl,
  cleanDoubleSlashes,
  cloneArray,
  getCleanPath,
  getParentPath,
  hasKeys,
  hasLeadingSlash,
  hasProtocol,
  isInternalPath,
  isLocaleDefault,
  isPageRedirectOnly,
  isSamePath,
  joinPath,
  lastPathSegment,
  nameKeyFirstSlash,
  nameKeyLastSlash,
  normalizePath,
  normalizePathForCompare,
  normalizeRouteKey,
  parentKeyFromSlashKey,
  parseFilename,
  parsePath,
  removeLeadingSlash,
  shouldAddLocalePrefix,
  transformNameKeyToPath,
  withoutLeadingSlash,
  withoutTrailingSlash,
} from "../src";

describe("@i18n-micro/utils path and route surface", () => {
  it("covers route helpers behavior", () => {
    expect(isPageRedirectOnly({ redirect: "/to" })).toBe(true);
    expect(cloneArray([{ a: 1 }])).toEqual([{ a: 1 }]);
    expect(buildRouteName("about", "en", true)).toBe("localized-about-en");
    expect(buildRouteName("about", "en", false)).toBe("localized-about");
    expect(buildRouteNameFromRoute(undefined, "/about/us")).toBe("about-us");
    expect(shouldAddLocalePrefix("de", { code: "en" } as any, true)).toBe(true);
    expect(isLocaleDefault("en", { code: "en" } as any)).toBe(true);
    expect(normalizeRouteKey("/x/[id]/[...slug]")).toBe("/x/:id/:slug(.*)*");
    expect(removeLeadingSlash("/about")).toBe("about");
    expect(joinPath("/", "en", "about")).toBe("/en/about");
    expect(buildFullPathNoPrefix("/about/")).toBe("/about");
    expect(isInternalPath("/robots.txt")).toBe(true);
  });

  it("covers path helpers behavior", () => {
    expect(hasLeadingSlash("/x")).toBe(true);
    expect(withoutLeadingSlash("/x")).toBe("x");
    expect(withoutTrailingSlash("/x/")).toBe("/x");
    expect(cleanDoubleSlashes("//a///b")).toBe("/a/b");
    expect(hasProtocol("https://a.b")).toBe(true);
    expect(hasKeys({ a: 1 })).toBe(true);
    expect(parsePath("/a?x=1#h")).toEqual({ pathname: "/a", search: "?x=1", hash: "#h" });
    expect(parseFilename("/a/b/file.txt")).toBe("file.txt");
    expect(isSamePath("/a/", "/a")).toBe(true);
    expect(buildUrl("/a", { x: 1 }, "#h")).toBe("/a?x=1#h");
    expect(normalizePath("//a//b/")).toBe("/a/b");
    expect(normalizePathForCompare("/a/b/")).toBe("/a/b");
    expect(getCleanPath("/a?x=1#h")).toBe("/a");
    expect(getParentPath("/a/b")).toBe("/a");
    expect(transformNameKeyToPath("a-b-c")).toBe("a/b/c");
    expect(nameKeyFirstSlash("abc")).toBe("abc");
    expect(nameKeyFirstSlash("a-b-c")).toBe("a/b-c");
    expect(nameKeyLastSlash("abc")).toBe("abc");
    expect(nameKeyLastSlash("a-b-c")).toBe("a-b/c");
    expect(parentKeyFromSlashKey("/a/b/c")).toBe("a-b");
    expect(lastPathSegment("/a/b/c")).toBe("c");
  });
});
