# Knowledge standard: versions

What the knowledge standard asks of a repository, version by version. A repository says which
version it follows with one line in its `AGENTS.md`:

> Knowledge standard: craft v1 (`/craft:scaffold check` upgrades it)

`/craft:scaffold` writes that line; `/craft:scaffold check` reads it and applies only the entries
above it, newest last; workbench's `sweep-standard.ts` files an upgrade issue in every repository
that is behind. A repository with no line is treated as v0: it gets the full check.

**Adding a version** (craft's P5): any change to what the standard asks of a repository (a new
file, a new section, a new rule a repository must follow) adds an entry here, in the same
commit. Each entry says what changed and, as checkable bullets, what a repository has to do. A
change that asks nothing of repositories (a skill's wording, a new skill) needs no entry.

## v1 — 2026-11-09

The baseline: everything the standard asked for when versioning started. A repository moving
from v0 runs the full `/craft:scaffold check`, then:

- [ ] The knowledge files exist and comply: `README.md`, `AGENTS.md`, `CLAUDE.md` as a shim,
      `principles.md`, `architecture.md`, `decisions.md` + `docs/adr/`, `security.md`, and
      `LICENSE` when distributed.
- [ ] Open work is in GitHub Issues with the `type:` / `priority:` / `area:` labels; no
      `tasks.md` unless `AGENTS.md` says a tool still reads it.
- [ ] `security.md` states the real surface and the dependency policy
      (`/craft:security check`).
- [ ] Dependency updates are automated when the repository has dependencies
      (`/craft:deps setup`).
- [ ] Mistakes follow the lessons ladder (contract § 3c): every principle has a real *Check*
      where one is possible, or an issue proposing it.
- [ ] `AGENTS.md` carries the line `Knowledge standard: craft v1`.
