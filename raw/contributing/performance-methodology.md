# Benchmark methodology

`pnpm test:performance` builds the same generated app without i18n, with `@nuxtjs/i18n` and with this module, then load-tests each build. Run it when a change may affect build time, memory or throughput. Results for the current release are on [Benchmarks](/guide/performance-results); this page explains what they measure and how to reproduce them.

## What is measured

<table>
<thead>
  <tr>
    <th>
      Layer
    </th>
    
    <th>
      Artifact
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      App
    </td>
    
    <td>
      Generated fixture, <code>
        nuxi build
      </code>
      
      , Nitro <code>
        node-server
      </code>
      
       output (<code>
        .output/server/index.mjs
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      Module
    </td>
    
    <td>
      Root <code>
        dist/module.mjs
      </code>
      
       from <code>
        nuxt-module-build build
      </code>
      
      ; the suite fails on a jiti stub
    </td>
  </tr>
  
  <tr>
    <td>
      Packages
    </td>
    
    <td>
      <code>
        @i18n-micro/*/dist
      </code>
      
      , built before the suite
    </td>
  </tr>
  
  <tr>
    <td>
      Load
    </td>
    
    <td>
      Artillery through <code>
        @untestutils/perf
      </code>
    </td>
  </tr>
</tbody>
</table>

Vite SPA output, `nuxi preview` and dev servers are not measured. The defaults are 4 locales, a 10,000-key target (`--keys 10000`, which the fixture rounds up to a tree of 16,807 leaf keys per locale: branch 7, depth 5) and 3 consecutive runs (means reported), with paths for `prefix_except_default`.

## Load profiles

<table>
<thead>
  <tr>
    <th>
      <code>
        --load
      </code>
    </th>
    
    <th>
      Window
    </th>
    
    <th>
      Use
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        short
      </code>
      
       (default)
    </td>
    
    <td>
      Warm 2 s at 10/s, main 10 s at 40/s, max 40 VUs
    </td>
    
    <td>
      Day to day and CI
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        mid
      </code>
    </td>
    
    <td>
      Warm 6 s at 6/s, main 30 s at 60/s, uncapped
    </td>
    
    <td>
      Between the two
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        full
      </code>
    </td>
    
    <td>
      Warm 6 s at 6/s, main 60 s at 60/s, uncapped
    </td>
    
    <td>
      Published numbers
    </td>
  </tr>
</tbody>
</table>

Absolute RPS scales with the window and the machine. In an A/B of all three profiles the ranking of the three apps never changed, so `short` is the default and `full` is kept for the published page.

## Cool-downs

<table>
<thead>
  <tr>
    <th>
      <code>
        --cool
      </code>
    </th>
    
    <th>
      After build
    </th>
    
    <th>
      Between runs
    </th>
    
    <th>
      Between targets
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        fast
      </code>
      
       (default)
    </td>
    
    <td>
      200 ms
    </td>
    
    <td>
      500 ms
    </td>
    
    <td>
      500 ms
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        strict
      </code>
    </td>
    
    <td>
      2 s
    </td>
    
    <td>
      3 s
    </td>
    
    <td>
      5 s
    </td>
  </tr>
</tbody>
</table>

`fast` preserves the ranking; `strict` reproduces the older pauses.

## Commands

```bash
# day to day: --load short --cool fast --runs 3
pnpm test:performance

# one target, or build times only
pnpm -C scripts cli performance --only micro
pnpm -C scripts cli performance --skip-load

# regenerate docs/guide/performance-results.md
pnpm -C scripts cli performance --load full --cool fast --runs 3 --only all
```

`--only` takes `plain`, `i18n`, `micro` or `all`. The results page is written only with `--load full --only all`.

## Related

<card-group>
<card icon="i-lucide-book-open" title="Benchmarks" to="/guide/performance-results">



</card>

<card icon="i-lucide-book-open" title="Performance" to="/guide/performance">



</card>

<card icon="i-lucide-git-pull-request" title="Maintenance commands" to="/contributing/maintenance-commands">



</card>
</card-group>
