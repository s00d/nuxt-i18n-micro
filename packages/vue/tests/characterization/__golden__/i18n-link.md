- `"/about"`
  - vue plain → <a href="/de/about" style="color: red;">L</a>
  - vue no router → <a href="/about">L</a>
  - nuxt → <a href="/de/about" style="color: red;">L</a>
- `"about"`
  - vue plain → <a href="/de/about" style="color: red;">L</a>
  - vue no router → <a href="about">L</a>
  - nuxt → <a href="/deabout">L</a>
- `"/about/"`
  - vue plain → <a href="/de/about" style="color: red;">L</a>
  - vue no router → <a href="/about/">L</a>
  - nuxt → <a href="/de/about/">L</a>
- `"/about?x=1#y"`
  - vue plain → <a href="/de/about?x=1#y">L</a>
  - vue no router → <a href="/about?x=1#y">L</a>
  - nuxt → <a href="/de/about?x=1#y" style="color: red;">L</a>
- `"#top"`
  - vue plain → <a href="/de/#top">L</a>
  - vue no router → <a href="#top">L</a>
  - nuxt → <a href="/de#top">L</a>
- `"?x=1"`
  - vue plain → <a href="/de/?x=1">L</a>
  - vue no router → <a href="?x=1">L</a>
  - nuxt → <a href="/de?x=1">L</a>
- `"/"`
  - vue plain → <a href="/de">L</a>
  - vue no router → <a href="/">L</a>
  - nuxt → <a href="/de/">L</a>
- `{"path":"/a","query":{"x":1}}`
  - vue plain → <a href="/de/a">L</a>
  - vue no router → <a href="/a">L</a>
  - nuxt → <a href="/de/a">L</a>
- `{"path":"/a","hash":"#h"}`
  - vue plain → <a href="/de/a">L</a>
  - vue no router → <a href="/a">L</a>
  - nuxt → <a href="/de/a">L</a>
- `{"name":"about"}`
  - vue plain → <a href="/de">L</a>
  - vue no router → <a href="/">L</a>
  - nuxt → <a href="/de">L</a>
- `{"name":"about","query":{"x":"1"},"hash":"#h"}`
  - vue plain → <a href="/de">L</a>
  - vue no router → <a href="/">L</a>
  - nuxt → <a href="/de">L</a>
- `"https://e.com/x"`
  - vue plain → <a href="https://e.com/x" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="https://e.com/x" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="https://e.com/x" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"HTTPS://e.com/x"`
  - vue plain → <a href="/de/HTTPS:/e.com/x">L</a>
  - vue no router → <a href="HTTPS://e.com/x">L</a>
  - nuxt → <a href="/deHTTPS://e.com/x">L</a>
- `"mailto:a@b.c"`
  - vue plain → <a href="mailto:a@b.c" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="mailto:a@b.c" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="mailto:a@b.c" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"Mailto:a@b.c"`
  - vue plain → <a href="/de/Mailto:a@b.c">L</a>
  - vue no router → <a href="Mailto:a@b.c">L</a>
  - nuxt → <a href="/deMailto:a@b.c">L</a>
- `"tel:+1"`
  - vue plain → <a href="tel:+1" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="tel:+1" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="tel:+1" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"report.pdf"`
  - vue plain → <a href="https://report.pdf" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="https://report.pdf" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="https://report.pdf" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"index.html"`
  - vue plain → <a href="https://index.html" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="https://index.html" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="https://index.html" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"example.com/x"`
  - vue plain → <a href="https://example.com/x" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="https://example.com/x" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="https://example.com/x" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"www.example.com"`
  - vue plain → <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"//cdn.e.com/y"`
  - vue plain → <a href="//cdn.e.com/y" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="//cdn.e.com/y" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="//cdn.e.com/y" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
