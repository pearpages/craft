# {{NAME}}

{{ONE_PARAGRAPH: what this project is, who it is for, and where it runs.}}

## Project documents — read before working

| File | Holds |
|---|---|
| [principles.md](principles.md) | The rules every change must follow |
| [architecture.md](architecture.md) | How the project is built: modules, data flow, build, deploy |
| [decisions.md](decisions.md) | Index of ADRs in `docs/adr/`: why each choice was made |
| [Issues]({{ISSUES_URL}}) | Open work{{BOARD_NOTE}}. Closed issues and git are the record of what was done |
| [security.md](security.md) | Threat surface, secrets, dependency policy, how to report a vulnerability |
| [LICENSE](LICENSE) | {{LICENSE_NAME}} (drop this row when there is no license) |

[README.md](README.md) is the user-facing entry point.

## Working rules

1. **Read `principles.md` before changing code or docs.** If a change would break a
   principle, stop and ask; don't work around it.
2. **Work is tracked in GitHub Issues**, not in a file. New work → `gh issue create` with
   `type:*`, `priority:*` and `area:*` labels. Finished work → close the issue from the commit
   or PR (`Fixes #N`).
3. **A structural or behavioural change updates `architecture.md` in the same commit**, and
   the README too when users can see it.
4. **A choice between real alternatives** (API shape, dependency, convention, process) gets
   a new ADR in `docs/adr/` plus a line in `decisions.md`. Propose it to the user before
   marking it Accepted. Never edit an accepted ADR; supersede it with a new one.
5. **Anything touching auth, secrets, input handling or dependencies is checked against
   `security.md`**, and updates it when the surface changes.
6. **At the end of a session, outcomes go to those files and the issues, not here.** This file keeps only
   how to work and pointers — never a session log.
7. Confirm before anything outward-facing: pushes, releases, publishing, deploys.

## Development commands

{{COMMANDS: one bullet per command — `cmd`: what it does. Prefer one-shot test commands (no watch mode).}}

## Pitfalls that have bitten before

{{PITFALLS: symptom → cause → fix. Empty at first; add as they happen.}}
