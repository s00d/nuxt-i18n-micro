# Test infrastructure baseline timings

Recorded after Playwright shared-host + Vitest workspace migration (2026-07-07).

Environment: local macOS, Node from project toolchain.

| Command                              | Duration (wall)                           | Notes                                                                              |
| ------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm test:workspaces`               | ~9s                                       | 77 files, 921 tests (1 pre-existing react characterization flake fixed separately) |
| `pnpm test:vitest`                   | run `time pnpm test:vitest` after changes | Root vitest (build-spawning tests)                                                 |
| `playwright test --project=shared`   | run after `pnpm clean:test`               | 32 specs, prebuilt fixtures                                                        |
| `playwright test --project=isolated` | —                                         | 13 specs with per-spec nuxtConfig                                                  |
| `playwright test --project=dev-hmr`  | —                                         | 2 HMR specs                                                                        |

## Targets (from migration plan)

| Suite                   | Before (est.)        | Target                           |
| ----------------------- | -------------------- | -------------------------------- |
| CI e2e (full)           | 45–80 min sequential | ~6–10 min per shard (warm cache) |
| Local Playwright (full) | 40+ min              | ~8–12 min                        |
| Package unit tests      | 3–4 min (14× Jest)   | ~20–40 s                         |

Re-run this table after CI sharding lands and compare.
