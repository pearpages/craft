# 0003. Version the knowledge standard, and sweep every repository for upgrades

- **Date:** 2026-11-09
- **Status:** Proposed

## Context

The standard that craft's skills follow keeps growing (the tracking setup, the lessons ladder,
dependency automation), and nothing tells a repository scaffolded earlier that it has fallen
behind. The owner keeps more than a dozen repositories on it.

The alternatives were:

1. Nothing: rerun `/craft:scaffold check` by hand now and then. Every check is a full re-audit,
   and a repository nobody opens never gets the change.
2. Version the standard: a changes file in craft, a version line in each repository's
   `AGENTS.md`, an upgrade step in `/craft:scaffold check`, and a sweep in workbench that files an
   upgrade issue where a repository is behind. This is the decision.
3. A bot that opens upgrade PRs in every repository. Most of the work is judgement (real
   principles, a real surface), so a PR full of TODOs would be noise.

## Decision

- `plugins/craft/references/standard-changes.md` lists the versions, each with what a
  repository has to do as checkable bullets. v1 is the baseline of 2026-11-09.
- A repository says which version it follows with `Knowledge standard: craft vN` in its
  `AGENTS.md`; no line means v0. `check.mjs` reports it as `standard`.
- `/craft:scaffold check` applies only the entries newer than the repository's version, then
  bumps the line (Step 1b).
- workbench's `scripts/sweep-standard.ts` reads the newest version from craft on GitHub and each
  repository's `AGENTS.md`, then files or updates one upgrade issue per repository that is
  behind, on the Backlog board. Dry run unless `--apply`.
- Any change to what the standard asks of a repository adds a version in the same commit (P5).

## Consequences

- (+) A change to the standard reaches every repository as one issue listing just what changed.
- (+) A repository that is behind keeps working: its own `AGENTS.md` wins where it disagrees.
- (−) Each standard change costs an entry in the changes file.
- (−) The sweep only sees repositories in workbench's `repos.yml`.
