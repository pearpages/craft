# 0004. Test the bundled scripts with Node's built-in test runner

- **Date:** 2026-11-09
- **Status:** Proposed

## Context

craft#8 moved `/craft:issue`'s duplicate rules into a pure module, `duplicates.mjs`, so they can
be tested without GitHub. craft had no unit tests and no test runner; its scripts use Node's
standard library only, and the repository has no `package.json`.

The alternatives were:

1. Node's built-in runner (`node:test`, `node --test`). This is the decision: part of Node, no
   dependency, no `package.json`, the same "standard library only" rule as the scripts.
2. vitest, as xray uses. Nicer output and watch mode, but craft's first dependency, a lockfile
   and a `package.json` to keep up to date.
3. No unit tests, checking scripts by hand against GitHub. That is how the bug in craft#8 slipped
   through.

## Decision

- A script's rules live in a module with no I/O, next to the script, with a `*.test.mjs` beside
  it using `node:test` and `node:assert/strict`.
- `node --test "plugins/craft/skills/*/scripts/*.test.mjs"` runs them once; it is in `AGENTS.md`.
- Skill behaviour stays covered by the evals (P6); unit tests cover the scripts' rules.

## Consequences

- (+) No dependency, nothing to install, runs anywhere Node 24 does.
- (+) The script's GitHub calls stay thin; the rules are tested in milliseconds.
- (−) Plainer output than vitest, and no coverage floor yet.
