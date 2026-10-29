# Rewrite playbook

How a package (or an area) is rewritten in this repo: routing (`route-strategy` + `path-strategy`), `core`, and whatever comes next. Goals every time: correctness first, small browser bundles, no new runtime dependencies, fastest hot path, flat code (no nested conditions or loops).

## 1. Scope the area, not the package

- A package is never rewritten alone. Map **every consumer** first: `grep` the imports and the members they touch (`this.helper.*`, overridden `protected` hooks, direct writes to exposed state such as `storage.translations`).
- The rewrite covers the **integration** too: adapters, the Nuxt runtime (`src/runtime/`), `src/module.ts` templates, server middleware, devtools, test-utils. When a consumer works around the package (its own cache, its own merge, its own copy of the logic), fix the model so the workaround disappears; do not patch both sides.
- Duplicated logic across framework packages moves into `core` / `utils` once.

## 2. Characterize before touching code

- Write **golden characterization tests** of the public behaviour first. Record every call as one line: `call → result`, matrix-generated, realistic fixtures, edge cases (prototype keys, unicode, empty, NaN, fractional, future dates, shared/aliased objects, direct state writes). Use `toMatchFileSnapshot` into `__golden__/*.md`; keep goldens out of `oxfmt` (`.oxfmtrc.json`).
- Generate the goldens from the **old** code and commit them on their own (`test(scope): characterization goldens …`).
- After the rewrite, every golden diff is either an intended fix (listed in the PR) or a bug in the rewrite. Read the whole diff; summarize it with `sort | uniq -c`.
- Also check the invariants, not just the outputs: inputs are not mutated, no cross-instance leaks, caches cannot be stale.

## 3. Independent audit and review

- Before the rewrite, a background agent audits the old code. Give it the code, the consumers, and the goals, but not your conclusions. Every finding must come with file:line, a repro the agent actually ran, actual vs expected, severity, and the consumer it affects. The agent must not edit the repo.
- While the agent runs, write the goldens.
- After the rewrite, a second agent reviews the diff the same way: regressions, cache holes, memory retention, prototype safety, bundling behaviour, consumer breaks.
- Fix every real finding. If a finding is left as is, say why in the PR.

## 4. Design rules

- **One model, one source of truth.** Build an index or derived structure once, then answer from it (routing: `meta.i18n` → index; core: chunks in `storage.translations`).
- **Shared data is immutable.** Never mutate a caller's object, a stored tree, or anything that can escape (`t()` results, `getCache`, cloned Maps). Writes copy along the changed path and store a new root.
- **Caches:**
  - Key a cache by identity (`WeakMap` on the immutable object) or by a full input key, so a write can never leave it stale.
  - Bound every cache and clear it wholesale.
  - Never cache dynamic misses.
  - Release strong references on `clearCache`.
- **No hidden shared state.** No module-level `WeakMap` keyed by mutable containers, and no generation counters to keep in sync.
- **Prototype safety.** Read own keys only, one property lookup on the hot path, and double-check only values that can be inherited (functions, `__proto__`, `Object.prototype` values). Skip `__proto__` on write.
- **Flat code:**
  - Early returns.
  - Small named helpers.
  - Lookup tables (`Record<kind, builder>`) instead of `if` chains.
  - No nested loops or nested conditions.
  - Match existing naming and comment density; comments say *why*.
- **Small bundle:** no new dependencies, reuse `@i18n-micro/utils/*`, keep heavy helpers out of browser entries.
- **Robust at the edges:**
  - Guard `process` access with `try { process.env.NODE_ENV } catch {}` so bundler `define` still works.
  - Listeners run over a copy and survive a throwing peer.
  - Invalid dates and NaN get explicit results.

## 5. Measure, A/B, same run

- Keep the old `dist` (copy it before rebuilding).
- Benchmark old and new `dist` in one script and one process. Report ns/op for every hot path and bundle min+gzip (esbuild, `NODE_ENV=production`).
- Run the benchmark at least twice; machine noise is real.
- A hot-path regression is a bug: fix the design (for example identity-keyed caches) instead of accepting it.
- An accepted cost (for example immutable merges) gets a `ponytail:` comment naming its ceiling, and a line in the PR.

## 6. Versions, docs, gates

- Breaking API or behaviour → major bump (agreed for routing and core). Otherwise one patch bump per changed package.
- Every dependent of a bumped package gets a patch bump so publish rewrites its pin. `check:versions -- --npm` lists them.
- Regenerate API docs and api-surface snapshots in this order: `pnpm run api:surface:update`, then `pnpm run docs:generate`. Rewrite stale READMEs. Never touch `docs/news/`.
- Before every push, run the full list in [pre-push-checks](pre-push-checks.md), plus `pnpm run test` and `pnpm run test:e2e`.
- Write full logs to files and read them with grep. Never truncate a log.

## 7. PRs

- One area per PR, opened as a **stack** with `gh stack`: each PR builds on the previous branch, never on `main`, while the earlier one is open.
- The PR body covers:
  - the model;
  - the fixes, each pinned by a golden line or test;
  - an A/B numbers table;
  - breaking changes;
  - dependent bumps;
  - checks run.
- Act on review-bot (cubic) findings at once. Verify each one, fix the real ones, and reply and resolve the thread with the reason.
- Never amend or force-push shared history. Follow-ups are new commits.
