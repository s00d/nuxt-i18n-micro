export function parseAcceptLanguage(header: string | undefined): string[] {
  if (!header) return [];

  return header
    .split(",")
    .map((entry, index) => {
      const [rawLang, ...params] = entry.split(";");
      const lang = (rawLang ?? "").trim();
      if (!lang) return null;

      let q = 1;
      for (const param of params) {
        const match = param.trim().match(/^q=([0-9.]+)$/i);
        if (!match?.[1]) continue;
        const parsed = Number.parseFloat(match[1]);
        if (!Number.isNaN(parsed)) {
          q = Math.max(0, Math.min(1, parsed));
        }
      }

      return { lang, q, index };
    })
    .filter((item): item is { lang: string; q: number; index: number } => item !== null)
    .sort((a, b) => {
      if (b.q !== a.q) return b.q - a.q;
      return a.index - b.index;
    })
    .map((item) => item.lang);
}
