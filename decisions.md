# Decisions

Architecture Decision Records for craft. Each ADR in `docs/adr/` records one choice, its
context and its trade-off. The rules that follow from them are in
[principles.md](principles.md).

New ADR: copy the format below, take the next number, and add a line here. An accepted ADR
is not edited; reversing it means a new ADR whose status says `Supersedes NNNN`, and the old
one's status becomes `Superseded by NNNN`. ADRs are proposed to the user before they are
accepted.

| # | Decision | Status | Date |
|---|---|---|---|
| [0001](docs/adr/0001-project-knowledge-files.md) | Project knowledge lives in principles, architecture, decisions and security; work in GitHub Issues | Accepted | 2026-11-08 |
| [0002](docs/adr/0002-craft-plugin-repository.md) | The owner's workflow skills live in craft, a plugin repository of their own | Accepted | 2026-11-08 |
| [0003](docs/adr/0003-versioned-knowledge-standard.md) | Version the knowledge standard, and sweep every repository for upgrades | Accepted | 2026-11-09 |

## Format

```md
# NNNN. Title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded by NNNN

## Context
What forces the choice.

## Decision
What we do.

## Consequences
What gets better (+) and what it costs (−).
```
