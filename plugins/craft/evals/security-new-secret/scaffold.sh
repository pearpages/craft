#!/usr/bin/env bash
set -euo pipefail

cat > README.md <<'EOF'
# demo
A tiny demo library.
## Install
npm install demo
## Usage
import { x } from "demo";
## Documentation
See architecture.md.
## License
MIT
EOF
printf '@AGENTS.md\n@principles.md\n' > CLAUDE.md
cat > AGENTS.md <<'EOF'
# demo
A tiny demo library.

| File | Holds |
|---|---|
| [principles.md](principles.md) | Rules |
| [architecture.md](architecture.md) | How it is built |
| [decisions.md](decisions.md) | ADR index |
| [Issues](https://github.com/example/demo/issues) | Open work |
| [security.md](security.md) | Security |

## Development commands

- `npm run build`: compile.
EOF
cat > principles.md <<'EOF'
# Principles
See [decisions.md](decisions.md) and [architecture.md](architecture.md).

**P1. Knowledge lives in its file.** *Why:* so the next person finds it. *Check:* review.
EOF
mkdir -p docs/adr src
cat > decisions.md <<'EOF'
# Decisions

| ADR | Decision | Status | Date |
|---|---|---|---|
| [0001](docs/adr/0001-project-knowledge-files.md) | Project knowledge lives in its files | Accepted | 2026-01-01 |
EOF
cat > docs/adr/0001-project-knowledge-files.md <<'EOF'
# 0001. Project knowledge lives in its files

- **Date:** 2026-01-01
- **Status:** Accepted

## Context
Alternatives: a wiki, or files. Files.

## Decision
Files.

## Consequences
- (+) Found next to the code.
EOF
cat > security.md <<'EOF'
# Security

## Reporting a vulnerability
Email security@example.invalid.

## Surface
None: a pure library with no I/O, no network and no environment variables.

## Secrets
None.

## Dependencies
Runtime dependencies: none.

## Known risks
None known.
EOF
printf 'node_modules/\n.env*\n' > .gitignore
printf 'root = true\n[*]\nindent_style = space\nindent_size = 2\n' > .editorconfig
printf 'export const x = 1;\n' > src/index.ts

cat > architecture.md <<'EOF'
# Architecture
See [principles.md](principles.md), [decisions.md](decisions.md), [security.md](security.md).

## Shape
A TypeScript library; `src/index.ts` is the entry point.

## Modules
| Path | Owns |
|---|---|
| `src/` | The library |

## Build, test, deploy
`npm run build` compiles with tsc.
EOF
git init -q -b main && git add -A && git -c user.name=eval -c user.email=eval@example.invalid commit -q -m init
git checkout -q -b feature
cat > src/payments.ts <<'EOF'
const STRIPE_KEY = process.env.STRIPE_KEY ?? "__FAKE_KEY__";
export async function charge(cents: number) {
  return fetch("https://api.stripe.com/v1/charges", {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_KEY}` },
    body: new URLSearchParams({ amount: String(cents), currency: "eur" }),
  });
}
EOF
# A fake test key, assembled here so the file in craft never looks like a real one to secret scanners.
FAKE_KEY="sk_""test_EVALFAKE0000000000000000"
perl -pi -e "s/__FAKE_KEY__/$FAKE_KEY/" src/payments.ts
git add -A && git -c user.name=eval -c user.email=eval@example.invalid commit -q -m "feat: charge cards"
