---
name: maturity
description: Assess how mature a project is and whether it is ready to advertise (announce on LinkedIn, social, newsletters, Hacker News). Use when the user asks if a project is ready to promote/launch/announce/share, asks for a maturity, readiness or launch checklist, asks "what's missing before we advertise X", or invokes /craft:maturity. Scans the repo with a bundled script (knowledge files, README, LICENSE, Open Graph tags, CNAME/docs site, package.json, CI, tests), reads the docs to judge quality, checks the live site, npm and GitHub, prints a scorecard with a verdict in chat, and files every gap as a GitHub issue through /craft:issue. Assesses only — it never fixes anything itself.
allowed-tools: Read, Grep, Glob, Edit, Write, Agent, Bash(ls:*), Bash(git log:*), Bash(git ls-files:*), Bash(git remote:*), Bash(git status:*), Bash(gh repo view:*), Bash(gh release list:*), Bash(npm view:*), Bash(npm pack --dry-run:*), Bash(curl -sI:*), Bash(curl -sL:*), Bash(node ${CLAUDE_PLUGIN_ROOT}/skills/maturity/scripts/scan.mjs:*)
---

# maturity — is this project ready to advertise?

Answer one question: **if we posted this project today, would a stranger who clicks the link
land somewhere that makes it look finished and trustworthy?** And if not, what exactly is
missing — filed as GitHub issues so the next sessions can close them.

**Scope:** read-only on the project. The only thing it creates is GitHub issues, through the
`/craft:issue`, after the user confirms. The
scorecard is printed in chat — **no report file is written to the repo**. The skill never
fixes a gap itself, even a trivial one; it names the fix and the skill that does it.

The knowledge-file standard (section A) is the one in
`${CLAUDE_PLUGIN_ROOT}/references/project-context.md`, which `/craft:scaffold` creates; when
unsure what "good" looks like for an item, compare with it.

## Step 0 — Target

`/craft:maturity [path]` — defaults to the current repo. Resolve the repo root (`git rev-parse` is
not in the allow-list; use the path given or the working directory).

## Step 1 — Scan

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/maturity/scripts/scan.mjs <repo>
```

JSON facts, no judgment: knowledge files (presence, size, last commit), ADR count, README
structure (headings, badges, first image line, install/example, links, stale markers),
package.json fields and `publishable`, every `CNAME` and its domain, each `index.html` entry's
`<title>`/description/favicon/OG/Twitter tags and whether the og:image exists locally, each
workflow's triggers and what it runs, test file count, git remote.

Decide the **project kind**: `package.publishable` true → *npm package* (section D applies);
otherwise *app / site / other* (D is n/a).

## Step 2 — Read and judge

Presence is not maturity. Read what exists and judge it:

- **CLAUDE.md / AGENTS.md** — short "how to work here" with pointers, or a growing session
  log? (A session log means knowledge has no proper home — a ⚠️.)
- **architecture.md / principles.md / decisions.md / security.md** — real content about *this* project, or
  a stub/template? Does decisions.md index the ADRs that exist?
- **README** — within the first screen: what it is, why, an image/card, install, a minimal
  working example. Then: link to the docs site, license. Spot-check **3 claims** against the
  code (install command and package name, an exported symbol, one feature or number such as a
  bundle size or variable count). A false claim is a ❌ under C.17.
- **Open issues** (`gh issue list`) — flag any bug a first-time user would hit in the happy path
  (C.18). In a project whose `AGENTS.md` says a tool still reads its `tasks.md`, read its open
  items instead.
- **Code quality** (TypeScript/JavaScript repos, when xray is available; see
  `${CLAUDE_PLUGIN_ROOT}/references/xray.md`): `quality -f agent --only hotspots,coverage,duplication`.
  High findings are evidence for C14 (a hotspot with no tests, an untested feature). Report the
  findings, never a score, and never let them block the verdict on their own.

For a large repo, delegate the claim spot-check to one Explore agent; otherwise do it inline.

## Step 3 — Remote checks

Run what is available; if a command fails (offline, no `gh`, unpublished), mark the item
**unverified** — never guess.

- Docs site: `curl -sI https://<cname-domain>` → 200 (follow redirects with `-sL` if 30x).
  `curl -sL https://<domain> | grep -i 'og:'` → the **live** page carries the OG tags (a
  client-rendered SPA that only injects them at runtime fails link previews).
  `curl -sI <og:image url>` → 200 and `content-type: image/*`.
- package.json `homepage` points at the docs domain.
- npm: `npm view <name> version` equals package.json `version` (or is one behind with an
  unreleased change — say which). `npm pack --dry-run` lists README and LICENSE.
- GitHub: `gh repo view --json description,homepageUrl,repositoryTopics,licenseInfo,isArchived`
  → description, website and topics set. `gh release list --limit 3` → releases with notes.

## Step 4 — Score

Each item gets ✅ done · ⚠️ present but weak · ❌ missing · ❔ unverified · — n/a.

### A. Project standard — blockers

| # | Item | ✅ when |
|---|---|---|
| A1 | `AGENTS.md` + `CLAUDE.md` | AGENTS.md short, how-to-work + pointers, not a session diary; CLAUDE.md imports `@AGENTS.md` + `@principles.md` |
| A2 | `architecture.md` | Describes how this project is built (modules, data flow, build) |
| A3 | `principles.md` | Explicit rules every change follows |
| A4 | `decisions.md` + ADRs | Index present, `docs/adr/` holds the key decisions (≥ a few, dated, with status) |
| A5 | Open work | In GitHub Issues with `type:*` / `priority:*` / `area:*` labels, no `tasks.md` (unless `AGENTS.md` says a tool still reads it); a leftover `tasks.md` is a ⚠️, fixed by `/craft:scaffold` |
| A6 | `README.md` | What/why, card image at top, install, minimal example, docs link, license |
| A7 | `LICENSE` | File exists and matches package.json `license` |
| A7b | `security.md` | Reporting channel, surface, secrets and dependency policy for this project; still true of the code (`/craft:security check`) |
| A8 | Open Graph | `og:title/description/image/url/image:alt` + `twitter:card=summary_large_image`; og:image 1200×630 exists and is live |
| A9 | Docs published | `CNAME` with a custom domain, site returns 200, `homepage` points to it |

### B. Discoverability

| # | Item | ✅ when |
|---|---|---|
| B10 | package.json metadata | `description`, `keywords`, `repository`, `homepage`, `bugs`, `author` |
| B11 | GitHub repo | Description, website link and topics set |
| B12 | Site basics | `<title>`, meta description, favicon, apple-touch-icon, `lang` |
| B13 | README signals | Badges (npm version, CI, license) and a live demo/docs link near the top |

### C. Trust & quality

| # | Item | ✅ when |
|---|---|---|
| C14 | Tests + CI | Tests exist; CI runs tests **and** lint on push (PRs too if the repo takes PRs) |
| C15 | Pipelines | CI deploys the docs; release is tag/workflow-driven; npm provenance / trusted publishing |
| C16 | Release notes | CHANGELOG, README "What's new", or GitHub Releases with notes for the current version |
| C17 | Honest docs | Spot-checked claims match the code; no TODO/TBD/"coming soon" in public docs |
| C18 | No first-user bugs | No Open task describes a bug hit on the happy path of the README example |

### D. npm package — only when publishable

| # | Item | ✅ when |
|---|---|---|
| D19 | Package shape | `exports`, `types`, `files`, `sideEffects` set; `publint` + `attw` (or equivalent) gate `prepublishOnly` |
| D20 | Tarball | Published version == package.json; tarball includes README and LICENSE |
| D21 | Dependencies | `peerDependencies` ranges sensible; runtime deps minimal; `engines` where relevant |
| D22 | Size | Bundle size stated in README and matching the build |

### E. Community — nice-to-have, never blocks

| # | Item | ✅ when |
|---|---|---|
| E23 | Contributor files | CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, issue/PR templates |

### Verdict

- **Not ready** — two or more ❌ in A, or any C18 bug.
- **Ready after blockers** — exactly one ❌ in A, or any ⚠️ in A.
- **Ready to advertise** — A all ✅ (❔ allowed only if stated); B–D gaps listed as polish.

E never changes the verdict.

## Step 5 — Print the scorecard (chat only)

```
## Maturity — <name> <version> · <date>

Verdict: **Ready after blockers** — <one-sentence why>

### A. Project standard
| # | Item | | Note |
| A1 | CLAUDE.md | ✅ | 66 lines, pointers only |
| A8 | Open Graph | ❌ | no og:* tags in demo/index.html |
…
(sections B–E the same way; collapse an all-✅ section to one line)

### Next 3 actions
1. <gap> — <fix>, via `<skill>`
```

Name the helper when one fits: `/craft:scaffold` (any missing or non-compliant A1–A7b file), `og-card` (1200×630 card), `/xray:check-diagrams`
(architecture.md diagrams that no longer match the code), `/xray:onboard` (first draft of
architecture.md for an unfamiliar repo), `/init`
(CLAUDE.md), `/craft:commit-message` (committing the fixes).

## Step 6 — File the gaps as issues

Use `/craft:issue`: queue one item per ❌ / ⚠️ / ❔, then push them in one go.

1. Each item: repo = the assessed project; kind `type:docs` for a doc or README gap,
   `type:chore` for config, CI or metadata, `type:bug` for a false claim or a happy-path bug;
   priority `high` for a blocker (A), `med` for B–D, `low` for E. Title: the item id and what
   to do, e.g. `A8: add Open Graph tags and a 1200×630 card`. Body: why it matters, where
   (file/path), and the skill that fixes it.
2. **Dedupe** against open issues (`gh issue list --search`): when one already covers a gap,
   don't queue it; mention the existing issue in the scorecard instead. When a gap from an
   earlier assessment is now ✅ and its issue is still open, say so and offer to close it.
3. Push through `/craft:issue`'s own confirmation. Don't write any file in the project, and
   don't commit.

In a project that keeps `tasks.md` for a tool (its `AGENTS.md` says so), add the gaps there
instead, under `## Open` → `### Advertising readiness`, one unchecked line each, and a dated
line at the top of `## Done`.

Finish with one line: how many issues were opened and where.
