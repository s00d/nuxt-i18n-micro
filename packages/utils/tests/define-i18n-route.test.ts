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

  it("parses config with comments and bracket string locale keys", () => {
    const content = `
<script setup lang="ts">
$defineI18nRoute({
  // should not break parser with braces { } and parens ()
  locales: ["en-us", "de-de"],
  localeRoutes: {
    ["de-de"]: "/locale-page-modify",
    "en-us": "/locale-test"
  },
  note: "value with ) and } inside string"
})
</script>
`;
    const parsed = extractDefineI18nRouteData(content, "locale-test.vue");
    expect(parsed).toEqual({
      locales: ["en-us", "de-de"],
      localeRoutes: {
        "de-de": "/locale-page-modify",
        "en-us": "/locale-test",
      },
      note: "value with ) and } inside string",
    });
  });

  it("returns null for dynamic template-literal computed keys", () => {
    const content = `
<script setup lang="ts">
const locale = "de-de";
$defineI18nRoute({
  locales: ["en-us", "de-de"],
  localeRoutes: {
    [\`\${locale}\`]: "/locale-page-modify"
  }
})
</script>
`;
    const parsed = extractDefineI18nRouteData(content, "locale-test.vue");
    expect(parsed).toBeNull();
  });
});
