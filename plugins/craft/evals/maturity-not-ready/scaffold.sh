#!/usr/bin/env bash
set -euo pipefail
cat > package.json <<'JSON'
{
  "name": "@acme/widgets",
  "version": "1.2.0",
  "description": "Tiny accessible UI widgets",
  "license": "MIT",
  "type": "module",
  "exports": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "repository": "github:acme/widgets",
  "scripts": { "build": "tsc", "test": "vitest run" }
}
JSON
cat > README.md <<'MD'
# widgets

Tiny accessible UI widgets: a tooltip, a disclosure and a toast, under 2 kB each.

## Install

```bash
npm install widgetkit
```

## Usage

```js
import { tooltip } from '@acme/widgets';
tooltip(document.querySelector('#save'), 'Save your work');
```
MD
cat > CLAUDE.md <<'MD'
@AGENTS.md
@principles.md
MD
cat > AGENTS.md <<'MD'
# widgets
Tiny accessible UI widgets. Read principles.md, architecture.md and decisions.md before working.
Open work is in GitHub Issues (https://github.com/acme/widgets/issues), labelled type:*, priority:*, area:*.

- `npm test`: run the tests once.
MD
cat > principles.md <<'MD'
# Principles
**P1. Every widget works with the keyboard alone.** *Why:* accessibility is the point. *Check:* `src/*.test.ts` press keys, never click.
**P2. No runtime dependencies.** *Why:* size. *Check:* CI fails when `dependencies` is not empty.
MD
cat > architecture.md <<'MD'
# Architecture
One module per widget in `src/`, each exporting a function that takes an element. `tsc` builds
`dist/`. Tests run in vitest with jsdom. No runtime dependencies.
MD
mkdir -p docs/adr src .github/workflows demo
cat > decisions.md <<'MD'
# Decisions
| ADR | Decision | Status |
|---|---|---|
| [0001](docs/adr/0001-knowledge-files.md) | Project knowledge files | Accepted |
| [0002](docs/adr/0002-no-runtime-deps.md) | No runtime dependencies | Accepted |
MD
printf '# 0001 Project knowledge files\nStatus: Accepted (2026-03-01)\n' > docs/adr/0001-knowledge-files.md
printf '# 0002 No runtime dependencies\nStatus: Accepted (2026-03-02)\n' > docs/adr/0002-no-runtime-deps.md
printf 'export function tooltip(el, text) { el.title = text; }\n' > src/tooltip.ts
printf 'export function disclosure(el) {}\n' > src/disclosure.ts
printf 'export function toast(text) {}\n' > src/toast.ts
printf "import { test } from 'vitest';\ntest('tooltip opens on focus', () => {});\n" > src/tooltip.test.ts
cat > .github/workflows/ci.yml <<'YML'
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test && npm run build
YML
cat > demo/index.html <<'HTML'
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>widgets demo</title></head>
<body><button id="save">Save</button><script type="module" src="./main.js"></script></body>
</html>
HTML
cat > ISSUES.md <<'MD'
What `gh issue list --repo acme/widgets` shows today (2026-11-10):

| # | Title | Labels |
|---|---|---|
| 3 | Add a LICENSE file (package.json says MIT) | type:chore, priority:high |
| 5 | Toast: add a close button | type:feature, priority:low |
MD
