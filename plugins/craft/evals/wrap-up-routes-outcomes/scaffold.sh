#!/usr/bin/env bash
set -euo pipefail
mkdir -p docs/adr src
cat > AGENTS.md <<'MD'
# gitlog
A CLI that summarises a repository's commits.

| File | Holds |
|---|---|
| [principles.md](principles.md) | Rules |
| [decisions.md](decisions.md) | ADR index |
| [security.md](security.md) | Dependency policy |

## Development commands
- `npm test`: run the tests.

## Pitfalls
MD
cat > principles.md <<'MD'
# Principles
**P1. Few dependencies.** A new runtime dependency needs an ADR. *Check:* review.
MD
cat > decisions.md <<'MD'
# Decisions
| ADR | Decision | Status | Date |
|---|---|---|---|
| [0001](docs/adr/0001-knowledge-files.md) | Project knowledge files | Accepted | 2026-01-01 |
MD
cat > docs/adr/0001-knowledge-files.md <<'MD'
# 0001. Project knowledge files
- **Status:** Accepted
MD
cat > security.md <<'MD'
# Security
## Dependencies
Prefer the standard library; each runtime dependency is justified in an ADR.
MD
cat > GIT-STATE.md <<'MD'
Repository: gitlog (origin https://github.com/example/gitlog), branch feat/4-since.

git status --short:
 M src/cli.mjs
 M src/range.mjs
?? test/range.test.mjs

git log --oneline @{upstream}..HEAD:
(no upstream: the branch was never pushed)

Open issues: #4 "Add a --since flag", #6 "Colour the output".
MD
