# craft

craft is a Claude Code plugin of workflow skills: how a software project is set up, decided,
planned, built and shipped. Its skills read and write a project's knowledge files (AGENTS.md,
principles, architecture, decisions, security, GitHub Issues) the same way in every repository.
Analysis of code belongs to [xray](https://github.com/pearpages/xray)'s plugin, not here. The
repository is a plugin marketplace (`.claude-plugin/marketplace.json`) with one plugin,
`plugins/craft/`; it runs inside Claude Code on the user's machine.

## Project documents — read before working

| File | Holds |
|---|---|
| [principles.md](principles.md) | The rules every change must follow |
| [architecture.md](architecture.md) | How the project is built: modules, data flow, build, deploy |
| [decisions.md](decisions.md) | Index of ADRs in `docs/adr/`: why each choice was made |
| [Issues](https://github.com/pearpages/craft/issues) | Open work, also on the [Backlog](https://github.com/users/pearpages/projects/3) board. Closed issues and git are the record of what was done |
| [security.md](security.md) | Threat surface, secrets, dependency policy, how to report a vulnerability |
| [LICENSE](LICENSE) | MIT |

[README.md](README.md) is the user-facing entry point.

Knowledge standard: craft v2 (`/craft:scaffold check` upgrades it)

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

- `claude plugin validate .`: check the marketplace and plugin manifests.
- `node --check plugins/craft/skills/*/scripts/*.mjs`: syntax-check the bundled scripts (Node
  24, `mise exec -- …` without a default Node).
- `claude --plugin-dir plugins/craft`: start Claude Code with the working copy of the plugin,
  to try a skill before pushing.
- `claude plugin eval plugins/craft --trust-plugin --scaffold`: run the skill evals in
  `plugins/craft/evals/` (each case builds a fixture repo, runs a skill, grades the result) and
  write a report; `--case <glob>` runs one. Each run is a real Claude session, so it costs and
  takes minutes: run it before pushing a skill change (P6), not on every commit.
- `claude plugin marketplace update craft && claude plugin update craft@craft`: refresh the
  installed copy after a push, then restart Claude Code.

## Pitfalls that have bitten before

- A new skill is "unknown command" after a push → the installed marketplace clone doesn't pull
  by itself → run the update command above, then restart (or add the README's `SessionStart` hook).
