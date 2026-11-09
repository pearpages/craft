---
name: deps
description: Keep a project's dependencies current without breaking its decisions. Use when asked to set up Dependabot or dependency updates, to go through, triage, merge or close dependency update PRs, to upgrade a package to a new major version, when asked whether dependencies are out of date, or on /craft:deps. Three modes, setup (writes .github/dependabot.yml for the package managers the repo uses, turns version limits in the ADRs into ignore rules, records the policy in security.md), triage (judges each open update PR against CI, the changelog, the ADRs and xray's report, then says merge, hold or close) and major <package> (one major upgrade, start to finish, on a branch). Works in any ecosystem Dependabot supports. Writes nothing, merges nothing and closes nothing without the user's OK.
---

# deps: dependencies, kept current on the project's terms

A bot can notice that a new version exists. It can't know that this project pinned a package on
purpose, or that an upgrade changes something an ADR decided. This skill sets up the bot
(Dependabot), then does the judging: which update PRs to merge, which to hold, and how to take a
major upgrade through.

**Scope:** writes `.github/dependabot.yml`, the Dependencies section of `security.md`, and, in
`major` mode, the code and lockfile on a branch. Merging, closing, pushing and opening PRs wait
for the user's OK. A new policy or a reversed limit goes through `/craft:adr`.

Before starting, follow `${CLAUDE_PLUGIN_ROOT}/references/project-context.md`.

## Step 0: mode

`/craft:deps [setup | triage | major <package>]`. With no mode: no `.github/dependabot.yml` →
`setup`; open update PRs → `triage`; otherwise report what is out of date (Step 1's commands)
and offer the modes.

## Step 1: read the project's terms

- **Package managers:** the manifests and lockfiles at the root and in workspaces
  (`package.json` + `package-lock.json`/`pnpm-lock.yaml`/`yarn.lock`, `requirements*.txt`/
  `pyproject.toml`, `Cargo.toml`, `go.mod`, `Gemfile`, `composer.json`, `Dockerfile`), and
  `.github/workflows/*.yml` for GitHub Actions.
- **Limits:** search `decisions.md` and the ADRs it points to for a package held back on
  purpose ("keep X on 6.x", "don't upgrade Y until…"), and the `AGENTS.md` pitfalls for the
  same. Each one is a rule this skill keeps.
- **Policy:** the Dependencies section of `security.md` (runtime deps minimal, lockfile
  committed, actions pinned by SHA or tag). Missing → `setup` proposes one.
- **Cost rules:** a principle that ties dependencies to a measurement (build time, bundle
  size, an Action's run time). Each upgrade that could move it says so.
- **What's out of date:** the ecosystem's own command (`npm outdated --json`,
  `pip list --outdated`, `cargo outdated` if installed). Report, don't change.

## setup

1. Draft `.github/dependabot.yml`: one `updates` entry per ecosystem and directory found
   (`npm`, `pip`, `cargo`, `gomod`, `docker`, `github-actions`…), weekly, with
   - a `groups` entry that puts patch and minor updates in one PR per ecosystem;
   - majors left as one PR each;
   - an `ignore` rule for every limit from Step 1, with a comment naming its ADR:
     ```yaml
     ignore:
       # ADR-0002: dependency-cruiser needs typescript < 7
       - dependency-name: "typescript"
         update-types: ["version-update:semver-major"]
     ```
   - `labels` from the project's own scheme (`type:chore`, `area:infra` or what it uses).
2. Draft the `security.md` Dependencies lines: how updates arrive (Dependabot, weekly, grouped),
   what the limits are and where they're decided, how majors are handled (`/craft:deps major`).
3. Choosing Dependabot over another updater (Renovate, none) is a choice: if `decisions.md`
   doesn't record it, offer an ADR through `/craft:adr`.
4. Show both files and write them on OK. Remind the user that Dependabot reads the file from
   the default branch, so it starts only after the change is merged.

## triage

List the open update PRs (`gh pr list --author app/dependabot --json number,title,headRefName`).
For each:

| Check | How |
|---|---|
| CI | `gh pr checks <n>` |
| Breaking changes | The changelog or release notes between the two versions; for a grouped PR, each package's |
| A limit | Does it cross a limit from Step 1? Then it should be ignored: close it and add the `ignore` rule |
| Impact | The xray report comment on the PR, when the project has xray: which features and dependents it touches |
| Cost | A cost rule from Step 1 that the upgrade could move: say what to re-measure |

Then one table, one verdict per PR, **merge** (CI green, no breaking change that applies),
**hold** (why, and what would unblock it) or **close** (crosses a limit; propose the `ignore`
rule). Ask once; merge or close only what the user approves (`gh pr merge`, `gh pr close`).
A major that needs code changes becomes `major <package>`.

## major <package>

1. Read the migration guide between the current and target versions. List what applies to this
   codebase (grep for the APIs it changes).
2. If an ADR set the current version, stop: lifting the limit is a decision. Offer
   `/craft:adr supersede NNNN`, and go on only after the user decides.
3. On a new branch: bump the version, update the lockfile with the ecosystem's command, make the
   code changes, then run the project's build and tests (the commands in `AGENTS.md`, one-shot,
   never watch mode).
4. Report what changed, what was tested, and any cost to re-measure. Offer
   `/craft:commit-message` and, once pushed, a PR. Close the Dependabot PR it replaces after this
   one is merged.

## Rules

- Never upgrade past a limit an ADR set, and never remove an `ignore` rule an ADR explains,
  without a superseding ADR the user accepted.
- Never merge a red PR, and never merge, close or push without the user's OK.
- A security advisory (`gh api repos/{owner}/{repo}/dependabot/alerts`, `npm audit`) is triage's
  first row: say how severe it is and whether the vulnerable path is reachable, and never put an
  unfixed vulnerability's details into a public issue.
- New dependencies are `/craft:security diff`'s job; this skill keeps existing ones current.
