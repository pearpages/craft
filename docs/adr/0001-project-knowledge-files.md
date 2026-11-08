# 0001. Project knowledge lives in principles, architecture, decisions and security; work in GitHub Issues

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

Agents and people need to find how to work here, the rules, how it is built, why choices
were made, what is open and what the risks are. Left alone, that knowledge piles up in the
agent instruction file as a session log, where it is hard to find and never pruned.

## Decision

- `AGENTS.md` holds how to work here and pointers — nothing else. `CLAUDE.md` only imports
  `AGENTS.md` and `principles.md`, so Claude Code always loads the rules; other agents read
  `AGENTS.md` and follow its links.
- `principles.md` — rules every change follows. `architecture.md` — how it is built.
  `decisions.md` + `docs/adr/` — why. `security.md` — threat surface, secrets,
  dependencies, reporting. `README.md` — for users. `LICENSE` when the
  project is distributed.
- Open work is a GitHub issue, labelled `type:*`, `priority:*` and `area:*`, on the owner's
  Backlog board. Finished work closes its issue (`Fixes #N`). There is no `tasks.md`.

## Consequences

+ Every kind of knowledge has one home; any agent finds it from `AGENTS.md`.
+ Principles are always in Claude's context without duplicating them.
− Five files to keep current; the working rules in `AGENTS.md` make updating them part of
  every change.
