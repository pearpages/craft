---
name: ci
description: Set up or check a project's CI, the GitHub Actions workflow that runs its tests, lint, type check and build on every push and pull request. Use when a repository has no CI, when asked to add, set up, fix or review CI, a GitHub Actions workflow or "checks on PRs", when /craft:scaffold or /craft:maturity points here, or on /craft:ci. Detects the stack and the commands the repository already has, writes .github/workflows/ci.yml with read-only permissions and pinned actions, records it in architecture.md, and files an issue for each check the project lacks (no tests, no lint) instead of inventing one. Writes nothing and pushes nothing without the user's OK.
---

# ci: run the project's own checks on every change

CI (continuous integration: GitHub running the checks on every push and pull request) is only as
good as the commands it runs. This skill wires up **the checks the project already has**, the
same way locally and in CI, and says plainly which ones are missing. It never makes up a test
suite or a lint config to fill the workflow.

**Scope:** writes `.github/workflows/ci.yml` and the "How it's tested" part of `architecture.md`,
and offers a `security.md` line. Missing checks become issues through `/craft:issue`; choosing a
tool the project doesn't use yet (a test runner, a linter) is a decision for `/craft:adr`. Never
commits or pushes.

Before starting, follow `${CLAUDE_PLUGIN_ROOT}/references/project-context.md`.

## Step 0: mode

`/craft:ci [setup | check]`. No workflow in `.github/workflows/` → `setup`; otherwise `check`.

## Step 1: read what the project already runs

- **The commands:** `AGENTS.md`'s development commands first (the project's own words), then the
  manifest: `package.json` `scripts` (and each workspace's), `Makefile`, `pyproject.toml`
  (`[tool.*]`, `[project.scripts]`), `Cargo.toml`, `go.mod`, `justfile`. Sort them into
  **install**, **lint**, **type check**, **test**, **build**, and **coverage** if it has a floor.
- **One-shot, never watch:** a test command that watches by default (`vitest`, `jest --watch`)
  runs once in CI: `npm test -- --run` for vitest, `CI=true` for jest. Use the form `AGENTS.md`
  gives when it gives one.
- **The runtime version:** `mise.toml`, `.tool-versions`, `.nvmrc`, `.python-version`,
  `engines`, `rust-toolchain.toml`. CI uses the same version, read from that file when the setup
  action can (`node-version-file`, `python-version-file`).
- **The package manager:** from the lockfile (`package-lock.json` → `npm ci`, `pnpm-lock.yaml`
  → pnpm, `yarn.lock`, `uv.lock`, `poetry.lock`, `Cargo.lock`).
- **Ordering rules:** `AGENTS.md` notes like "build before testing" or "tests import from
  `dist`" decide the step order.
- **Policy:** `security.md` (pinned actions, permissions) and any ADR about CI or the build.

## setup

Draft `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]        # the default branch
  pull_request:
permissions:
  contents: read            # nothing more unless a step needs it
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<pinned>
      - uses: actions/setup-node@<pinned>   # or setup-python, dtolnay/rust-toolchain…
        with:
          node-version-file: <the version file>
          cache: npm
      - run: npm ci
      - run: <lint>
      - run: <type check>
      - run: <build>          # before test when tests need the build
      - run: <test, one-shot>
```

- **Pin every action** the way `security.md` says (a full commit SHA with the version in a
  comment, or a major tag). Without a rule, pin by major tag and offer the rule.
- **Only real steps.** A kind of check the project has no command for gets no step; it gets a
  row in the report and an issue.
- **Monorepos:** one job runs the root commands when they cover the workspaces; split jobs only
  when the project already runs them separately.
- **Secrets:** none by default. A step that needs one is named in the report, never filled in.

Then draft the `architecture.md` "How it's tested" text (standard v2): the kinds of tests, where
they live, the one-shot command, and "CI runs lint, type check, build and tests on every push and
PR". Offer a `security.md` line: "CI runs with read-only permissions; actions pinned by …".

Show the workflow and the doc edits, write them on OK, and say that the workflow starts on the
next push. Point to `/craft:deps setup` so the pinned actions get update PRs.

## check

Read the existing workflows and report, one row each:

| Check | Problem looks like |
|---|---|
| Triggers | No `pull_request`, or pushes to a branch that isn't the default |
| Same commands | CI runs something different from `AGENTS.md`'s commands, or a watch-mode test |
| Missing step | The project has a lint, type check or build command CI doesn't run |
| Permissions | No `permissions:` block, or more than the steps need |
| Pinning | An action on a branch (`@main`) or unpinned, against `security.md` |
| Runtime | A hard-coded version that differs from the project's version file |
| Docs | `architecture.md` doesn't say what CI runs |

Propose each fix as a small diff; apply only what the user approves.

## Report

```
## CI · <setup|check> · <repo> · <date>

| Check | Command | In CI |
|---|---|---|
| Lint | npm run lint | ✅ |
| Type check | npm run typecheck | ✅ |
| Test | npm test -- --run | ✅ |
| Coverage | — | ❌ no coverage floor: issue proposed |
```

Then ask once: apply the files (all / pick / skip), and open the issues for the missing checks
through `/craft:issue` (`type:chore`, `area:infra`).

## Rules

- Never invent a check: no new test runner, linter or config files. Each missing one is an issue,
  and choosing the tool is an ADR.
- CI runs the project's own commands; if CI needs a different one, `AGENTS.md` changes too, so
  local and CI stay the same.
- Never add secrets, deploy steps or write permissions without the user asking; deploying is a
  separate job.
- Never commit, push or merge.
