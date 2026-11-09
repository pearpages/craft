# craft

Claude Code skills for how a software project is built: its decisions, its work and its way of
shipping.

Every project here keeps its knowledge in the same files: `AGENTS.md`, `principles.md`,
`architecture.md`, `decisions.md` with `docs/adr/`, `security.md`, and GitHub Issues. craft's
skills read and write those files the same way everywhere, so a decision, a rule or a to-do
always lands where the next person looks for it. For analysing code, see
[xray](https://github.com/pearpages/xray)'s plugin.

## Install

```sh
claude plugin marketplace add pearpages/craft
claude plugin install craft@craft
```

Restart Claude Code after installing or updating.

To have `/craft:issue` put issues on a GitHub project board, name it in your `~/.claude/CLAUDE.md`
(for example "Backlog board: `@me` project `3`"), or link it in a project's `AGENTS.md`.

## Usage

| Command | What it does |
|---|---|
| `/craft:scaffold` | Creates a project's knowledge files, or checks an existing project against the standard |
| `/craft:adr` | Records a decision as an ADR: proposes it, accepts it on your word, supersedes an old one, or checks the index |
| `/craft:issue` | Queues issues and pushes them in one go: right repo, labels, your board if you have one, no duplicates |
| `/craft:commit-message` | Writes a commit message in the repo's own convention and commits on your OK |
| `/craft:diagram` | Draws Mermaid diagrams of flows, lifecycles, decisions and data, into the right doc |
| `/craft:security` | Checks a change against the project's `security.md` and keeps the file true: `diff`, `audit` (onboarding) or `check` |
| `/craft:deps` | Keeps dependencies current on the project's terms: sets up Dependabot, triages its PRs, takes a major upgrade through |
| `/craft:wrap-up` | Closes a session: routes its decisions, pitfalls and to-dos to the right files and issues, then lists what's still uncommitted or pending |
| `/craft:maturity` | Is the project ready to advertise? A scorecard, and every gap filed as an issue |

```text
/craft:adr we keep TypeScript on 6.x until dependency-cruiser supports 7
```

## Keeping things in sync

- **Your installed copy.** Claude Code doesn't pull a marketplace by itself. To stay current
  without thinking about it, add a `SessionStart` hook to `~/.claude/settings.json` that refreshes
  it in the background; the new version loads on your next start:

  ```json
  "SessionStart": [{ "hooks": [{ "type": "command",
    "command": "nohup sh -c 'claude plugin marketplace update craft && claude plugin update craft@craft' >/dev/null 2>&1 &" }] }]
  ```

- **Your repositories.** Each project's `AGENTS.md` says which version of the standard it
  follows (`Knowledge standard: craft vN`). When craft's standard changes, a new version lands in
  [standard-changes.md](plugins/craft/references/standard-changes.md); run `/craft:scaffold check`
  in a project to apply just what changed since its version.

## Documentation

How it is built is in [architecture.md](architecture.md). Contributors and agents start at
[AGENTS.md](AGENTS.md).

## License

MIT — see [LICENSE](LICENSE).
