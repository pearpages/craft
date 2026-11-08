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

## Usage

| Command | What it does |
|---|---|
| `/craft:adr` | Records a decision as an ADR: proposes it, accepts it on your word, supersedes an old one, or checks the index |

```text
/craft:adr we keep TypeScript on 6.x until dependency-cruiser supports 7
```

## Documentation

How it is built is in [architecture.md](architecture.md). Contributors and agents start at
[AGENTS.md](AGENTS.md).

## License

MIT — see [LICENSE](LICENSE).
