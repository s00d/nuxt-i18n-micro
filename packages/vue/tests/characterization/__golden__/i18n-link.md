- `"/about"`
  - vue plain → <a href="/de/about" style="color: red;">L</a>
  - vue no router → <a href="/about">L</a>
  - nuxt → <a href="/de/about" style="color: red;">L</a>
- `"about"`
  - vue plain → <a href="/de/about" style="color: red;">L</a>
  - vue no router → <a href="about">L</a>
  - nuxt → <a href="/de/about" style="color: red;">L</a>
- `"/about/"`
  - vue plain → <a href="/de/about" style="color: red;">L</a>
  - vue no router → <a href="/about/">L</a>
  - nuxt → <a href="/de/about" style="color: red;">L</a>
- `"/about?x=1#y"`
  - vue plain → <a href="/de/about?x=1#y" style="color: red;">L</a>
  - vue no router → <a href="/about?x=1#y">L</a>
  - nuxt → <a href="/de/about?x=1#y" style="color: red;">L</a>
- `"#top"`
  - vue plain → <a href="/de/about#top" style="color: red;">L</a>
  - vue no router → <a href="#top">L</a>
  - nuxt → <a href="/de/about#top" style="color: red;">L</a>
- `"?x=1"`
  - vue plain → <a href="/de/about?x=1" style="color: red;">L</a>
  - vue no router → <a href="?x=1">L</a>
  - nuxt → <a href="/de/about?x=1" style="color: red;">L</a>
- `"/"`
  - vue plain → <a href="/de">L</a>
  - vue no router → <a href="/">L</a>
  - nuxt → <a href="/de">L</a>
- `{"path":"/a","query":{"x":1}}`
  - vue plain → <a href="/de/a?x=1">L</a>
  - vue no router → <a href="/a?x=1">L</a>
  - nuxt → <a href="/de/a?x=1">L</a>
- `{"path":"/a","hash":"#h"}`
  - vue plain → <a href="/de/a#h">L</a>
  - vue no router → <a href="/a#h">L</a>
  - nuxt → <a href="/de/a#h">L</a>
- `{"name":"about"}`
  - vue plain → <a href="/de/about" style="color: red;">L</a>
  - vue no router → <a href="/">L</a>
  - nuxt → <a href="/de/about" style="color: red;">L</a>
- `{"name":"about","query":{"x":"1"},"hash":"#h"}`
  - vue plain → <a href="/de/about?x=1#h" style="color: red;">L</a>
  - vue no router → <a href="/?x=1#h">L</a>
  - nuxt → <a href="/de/about?x=1#h" style="color: red;">L</a>
- `"https://e.com/x"`
  - vue plain → <a href="https://e.com/x" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="https://e.com/x" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="https://e.com/x" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"HTTPS://e.com/x"`
  - vue plain → <a href="HTTPS://e.com/x" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="HTTPS://e.com/x" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="HTTPS://e.com/x" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"mailto:a@b.c"`
  - vue plain → <a href="mailto:a@b.c" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="mailto:a@b.c" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="mailto:a@b.c" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"Mailto:a@b.c"`
  - vue plain → <a href="Mailto:a@b.c" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="Mailto:a@b.c" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="Mailto:a@b.c" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"tel:+1"`
  - vue plain → <a href="tel:+1" target="_blank" rel="noopener noreferrer">L</a>
  - vue no router → <a href="tel:+1" target="_blank" rel="noopener noreferrer">L</a>
  - nuxt → <a href="tel:+1" target="_blank" rel="noopener noreferrer">
  <!-- @slot Link content. -->L
</a>
- `"report.pdf"`
  - vue plain → <a href="/de/report.pdf">L</a>
  - vue no router → <a href="report.pdf">L</a>
  - nuxt → <a href="/de/report.pdf">L</a>
- `"index.html"`
  - vue plain → <a href="/de/index.html">L</a>
  - vue no router → <a href="index.html">L</a>
  - nuxt → <a href="/de/index.html">L</a>
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
