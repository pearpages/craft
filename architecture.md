# Architecture

How craft is built. It explains *how* things work. The rules that follow from it are in
[principles.md](principles.md), the reasons for each choice in
[decisions.md](decisions.md), the security surface in [security.md](security.md), and open
work in GitHub Issues (TODO: issues link once the repo is on GitHub). When code and this file
disagree, the code is right and this file is a bug.

## Shape

A Claude Code plugin marketplace. Skills are Markdown (`SKILL.md` with YAML frontmatter) that
Claude Code loads as `/craft:<skill>` commands. There is no build and no runtime dependency.
The plugin manifest has no `version`, so every pushed commit is a new version.

## Modules

| Path | Owns |
|---|---|
| `.claude-plugin/marketplace.json` | The marketplace: lists the `craft` plugin |
| `plugins/craft/.claude-plugin/plugin.json` | The plugin's name, description and links |
| `plugins/craft/skills/adr/` | `/craft:adr`: propose, accept, supersede and check Architecture Decision Records in any repository |

## Data flow

A user installs the marketplace from GitHub (`claude plugin marketplace add pearpages/craft`),
then the plugin. Claude Code reads each `SKILL.md` description to decide when a skill applies,
and loads its body when it runs. A skill reads and edits files in the repository Claude Code is
working in; it keeps no state of its own.

## Build, test, deploy

- No build. `claude plugin validate .` checks the manifests.
- A skill is tried locally with `claude --plugin-dir plugins/craft` before it is pushed.
- Release: a push to `main` on GitHub. Users get it with `claude plugin marketplace update
  craft` and `claude plugin update craft@craft`.
