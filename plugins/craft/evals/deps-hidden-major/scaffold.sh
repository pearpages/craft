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

cat > package.json <<'EOF'
{ "name": "demo", "version": "1.0.0", "private": true,
  "scripts": { "build": "tsc", "test": "vitest run" },
  "devDependencies": { "typescript": "^6.0.0", "vitest": "^5.0.0", "jscpd": "^4.3.0" } }
EOF
mkdir -p .github
cat > .github/dependabot.yml <<'EOF'
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      npm:
        patterns: ["*"]
    ignore:
      # ADR-0002: keep typescript on 6.x
      - dependency-name: typescript
        versions: [">=7"]
EOF
cat > docs/adr/0002-typescript-6.md <<'EOF'
# 0002. Keep typescript on 6.x while our analyser does not support 7

- **Date:** 2026-01-02
- **Status:** Accepted

## Context
Alternatives: upgrade to 7 and drop the analyser, or stay on 6. Stay on 6.

## Decision
typescript stays on 6.x.

## Consequences
- (−) No TypeScript 7 features.
EOF
printf '| [0002](docs/adr/0002-typescript-6.md) | Keep typescript on 6.x | Accepted | 2026-01-02 |\n' >> decisions.md
git init -q -b main && git add -A && git -c user.name=eval -c user.email=eval@example.invalid commit -q -m init
