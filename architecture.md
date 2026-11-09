# Architecture

How craft is built. It explains *how* things work. The rules that follow from it are in
[principles.md](principles.md), the reasons for each choice in
[decisions.md](decisions.md), the security surface in [security.md](security.md), and open
work in [GitHub Issues](https://github.com/pearpages/craft/issues). When code and this file
disagree, the code is right and this file is a bug.

## Shape

A Claude Code plugin marketplace. Skills are Markdown (`SKILL.md` with YAML frontmatter) that
Claude Code loads as `/craft:<skill>` commands; some bundle a Node script that uses only the
standard library. There is no build and no dependency.
The plugin manifest has no `version`, so every pushed commit is a new version.

## Modules

| Path | Owns |
|---|---|
| `.claude-plugin/marketplace.json` | The marketplace: lists the `craft` plugin |
| `plugins/craft/.claude-plugin/plugin.json` | The plugin's name, description and links |
| `plugins/craft/references/project-context.md` | The contract: where a project keeps its knowledge, when each skill reads or writes each file, and where the labels and board come from (§ 2b), and the memory admission test (§ 3b), and the lessons ladder for mistakes (§ 3c). Every skill opts in with one line |
| `plugins/craft/references/standard-changes.md` | The standard's versions: what each one asks of a repository. `scaffold/scripts/check.mjs` reads the newest; workbench's sweep reads it from GitHub |
| `plugins/craft/references/xray.md` | How a craft skill uses xray's data when xray's plugin is installed (`maturity`) |
| `plugins/craft/skills/scaffold/` | `/craft:scaffold`: creates or checks the knowledge files; `scripts/check.mjs` gathers the facts, `templates/` holds the files |
| `plugins/craft/skills/adr/` | `/craft:adr`: propose, accept, supersede and check Architecture Decision Records in any repository |
| `plugins/craft/skills/issue/` | `/craft:issue`: queue issues, then push them; `scripts/push.mjs` creates them with `gh` and adds them to a board when given one |
| `plugins/craft/skills/commit-message/` | `/craft:commit-message`: a message in the repo's convention, then the commit, on OK |
| `plugins/craft/skills/diagram/` | `/craft:diagram`: Mermaid diagrams of behaviour and data (code maps belong to xray) |
| `plugins/craft/skills/security/` | `/craft:security`: the surface a diff adds, a whole-repo audit, or drift in `security.md`; hands the bug hunt to the built-in `/security-review` |
| `plugins/craft/skills/deps/` | `/craft:deps`: Dependabot setup with the ADRs' version limits as ignore rules, triage of update PRs, one major upgrade at a time |
| `plugins/craft/skills/wrap-up/` | `/craft:wrap-up`: end-of-session routing of outcomes to files and issues, and a checklist of what's open |
| `plugins/craft/skills/maturity/` | `/craft:maturity`: is the project ready to advertise; `scripts/scan.mjs` gathers the facts, gaps become issues |

## Data flow

A user installs the marketplace from GitHub (`claude plugin marketplace add pearpages/craft`),
then the plugin. Claude Code reads each `SKILL.md` description to decide when a skill applies,
and loads its body when it runs. Each skill first follows the contract, then reads and edits
files in the repository Claude Code is working in. The only state kept outside a repository is
`/craft:issue`'s queue, `~/.cache/issue/queue.json`, so a queue survives between sessions.

## Keeping repositories and skills in sync

- **Installed skills ← this repository:** the installed marketplace doesn't pull by itself. A
  user keeps it current with the update commands, or a `SessionStart` hook that runs them in the
  background (README). A new version loads on the next start.
- **Repositories ← the standard:** each repository's `AGENTS.md` names the standard version it
  follows. `/craft:scaffold check` upgrades it from `standard-changes.md`; the owner's workbench
  sweep (`scripts/sweep-standard.ts`) files one upgrade issue per repository that is behind
  ([ADR-0003](docs/adr/0003-versioned-knowledge-standard.md)).
- **The standard ← repositories:** `/craft:wrap-up` asks whether a lesson is generic and, if so,
  proposes an issue here, which becomes the next version.

## Build, test, deploy

- No build. `claude plugin validate .` checks the manifests; `node --check` the scripts.
- A skill is tried locally with `claude --plugin-dir plugins/craft` before it is pushed.
- Release: a push to `main` on GitHub. Users get it with `claude plugin marketplace update
  craft` and `claude plugin update craft@craft`.
