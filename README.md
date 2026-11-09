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
| `/craft:wrap-up` | Closes a session: routes its decisions, pitfalls and to-dos to the right files and issues, then lists what's still uncommitted or pending |
| `/craft:maturity` | Is the project ready to advertise? A scorecard, and every gap filed as an issue |

```text
/craft:adr we keep TypeScript on 6.x until dependency-cruiser supports 7
```

## Documentation

How it is built is in [architecture.md](architecture.md). Contributors and agents start at
[AGENTS.md](AGENTS.md).

## License

MIT — see [LICENSE](LICENSE).
