import { describe, expect, it } from "vitest";
import {
  extractBaseRoutePattern,
  findAllowedLocalesForRoute,
  isMetaDisabledForRoute,
} from "../src";

describe("@i18n-micro/utils runtime route helpers", () => {
  it("extracts base route pattern from localized matcher path", () => {
    expect(extractBaseRoutePattern("/:locale(en|de)/about/:id()")).toBe("/about/[id]");
    expect(extractBaseRoutePattern("/:locale(en|de)")).toBe("/");
  });

  it("finds allowed locales by route name and locale-prefixed path", () => {
    const routeLocales = {
      about: ["en", "de"],
      "/contact": ["en"],
    };

    const byName = findAllowedLocalesForRoute(
      { path: "/en/about", name: "localized-about-en" },
      routeLocales,
      "localized-",
      ["en", "de"],
    );
    expect(byName).toEqual(["en", "de"]);

    const byPrefixedPath = findAllowedLocalesForRoute(
      { path: "/en/contact" },
      routeLocales,
      "localized-",
      ["en", "de"],
    );
    expect(byPrefixedPath).toEqual(["en"]);

    const rootFromLocaleOnlyPath = findAllowedLocalesForRoute(
      { path: "/en" },
      { "/": ["en", "de"] },
      "localized-",
      ["en", "de"],
    );
    expect(rootFromLocaleOnlyPath).toEqual(["en", "de"]);
  });

  it("checks routeDisableMeta rules for locale arrays", () => {
    const disabled = isMetaDisabledForRoute(
      { path: "/about", name: "about" },
      { about: ["de"] },
      "de",
      "localized-",
    );
    const enabled = isMetaDisabledForRoute(
      { path: "/about", name: "about" },
      { about: ["de"] },
      "en",
      "localized-",
    );
    expect(disabled).toBe(true);
    expect(enabled).toBe(false);
  });
});
