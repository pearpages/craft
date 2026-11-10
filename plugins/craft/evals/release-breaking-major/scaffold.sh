#!/usr/bin/env bash
set -euo pipefail
mkdir -p docs/adr
cat > AGENTS.md <<'EOF'
# lintkit
A GitHub Action that lints Markdown. Consumers use `uses: example/lintkit@v1`.

| File | Holds |
|---|---|
| [decisions.md](decisions.md) | ADR index |

## Development commands

- Release, after merging to `main` with CI green ([ADR-0003](docs/adr/0003-versioning.md)):
  `git tag -a vX.Y.Z -m "vX.Y.Z" && git tag -f vN vX.Y.Z && git push origin vX.Y.Z && git push -f origin vN`,
  where `vN` is the moving major tag.
EOF
cat > decisions.md <<'EOF'
# Decisions
| ADR | Decision | Status | Date |
|---|---|---|---|
| [0003](docs/adr/0003-versioning.md) | Semver tags and a moving major tag | Accepted | 2026-01-03 |
EOF
cat > docs/adr/0003-versioning.md <<'EOF'
# 0003. Semver tags and a moving major tag

- **Status:** Accepted

## Decision
- Releases are `vX.Y.Z` tags that never move. A moving major tag (`v1`) points at the latest
  release of that major; consumers use it.
- Major for a change that breaks consumers (a removed input, a dropped runtime), with a **new**
  moving major tag (`v2`); the old one (`v1`) stays where it is. Minor for features, patch for fixes.
EOF
cat > RELEASE-STATE.md <<'EOF'
git and GitHub don't work in this sandbox, so here is what they would say.

Tags (newest first): v1.4.0, v1, v1.3.2, v1.3.1. `v1` points at v1.4.0.
CI on main: green. Working tree: clean.

Merged since v1.4.0:
- #15 feat!: drop the `config-path` input; read `.lintkit.yml` from the repo root
- #16 fix: a heading with trailing spaces no longer counts as a duplicate
- #17 feat: a `--fix` mode that rewrites list markers
- #18 docs: explain the rules in the README
- #19 test: cover nested lists
EOF
