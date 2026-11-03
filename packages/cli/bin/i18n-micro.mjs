#!/usr/bin/env node
// Committed, unlike dist: pnpm links workspace bins at install time, before `dist` is built.
import '../dist/cli.mjs'
