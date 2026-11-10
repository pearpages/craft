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
- `node --test "plugins/craft/skills/*/scripts/*.test.mjs"`: run the scripts' unit tests once
  (Node's built-in runner, no dependencies; [ADR-0004](docs/adr/0004-node-test-runner-for-scripts.md)).
- `claude --plugin-dir plugins/craft`: start Claude Code with the working copy of the plugin,
  to try a skill before pushing.
- `claude plugin eval plugins/craft --trust-plugin --scaffold --allow-tools Bash Write Edit`: run the skill evals in
  `plugins/craft/evals/` (each case builds a fixture repo, runs a skill, grades the result) and
  write a report; `--case <glob>` runs one. Each run is a real Claude session, so it costs and
  takes minutes: run it before pushing a skill change (P6), not on every commit.
- `claude plugin marketplace update craft && claude plugin update craft@craft`: refresh the
  installed copy after a push, then restart Claude Code.

## Pitfalls that have bitten before

- A new skill is "unknown command" after a push → the installed marketplace clone doesn't pull
  by itself → run the update command above, then restart (or add the README's `SessionStart` hook).
- An eval's `llm` grader fails although the skill did the right thing → `focus: files` hands the
  judge only the created files' names, and an `llm` grader takes no `target` → judge the final
  answer (the skill shows what it wrote), and check file contents with `regex` graders.
- `claude plugin eval --case a --case b` runs only one case → it takes one glob → run one case per
  call, or a glob that matches both.
- An eval run can't run the project's tests or git ("xcrun" or "No version is set for shim") →
  the eval sandbox has a fresh `HOME`, so neither mise's Node nor the system git works there → grade
  what the skill wrote and reported, and accept "couldn't run X here, run `cmd`" instead of a real run.
- An eval run says it "has no tool that can write files or run commands" and every implement
  grader on files fails → since Claude Code 2.1.322 the eval sandbox gates Bash, Write and Edit →
  pass `--allow-tools Bash Write Edit` (the command above has it).
- A push is rejected for a "Stripe Test API Secret Key" in an eval case → GitHub push protection
  scans fixtures too → build a fake key from pieces in `scaffold.sh` (see `security-new-secret`).
