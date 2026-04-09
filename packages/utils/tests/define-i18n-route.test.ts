import { describe, expect, it } from "vitest";
import { extractDefineI18nRouteData } from "../src";

describe("@i18n-micro/utils extractDefineI18nRouteData", () => {
  it("extracts plain locale array from script", () => {
    const content = `
<script setup lang="ts">
$defineI18nRoute({ locales: ["en", "de"], localeRoutes: { en: "/about" } })
</script>
`;
    const parsed = extractDefineI18nRouteData(content, "about.vue");
    expect(parsed).toEqual({
      locales: ["en", "de"],
      localeRoutes: { en: "/about" },
    });
  });

  it("normalizes locale object map with path values", () => {
    const content = `
<script setup lang="ts">
$defineI18nRoute({
  locales: {
    en: { path: "/about" },
    de: { path: "/uber" }
  }
})
</script>
`;
    const parsed = extractDefineI18nRouteData(content, "about.vue");
    expect(parsed).toEqual({
      locales: ["en", "de"],
      localeRoutes: { en: "/about", de: "/uber" },
    });
  });
});
