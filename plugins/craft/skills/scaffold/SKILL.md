---
name: scaffold
description: Scaffold a project's knowledge files, or check that an existing project complies with the standard. The standard is README.md; AGENTS.md as the canonical agent file; CLAUDE.md as a shim that imports AGENTS.md and principles.md; principles.md, architecture.md, decisions.md with docs/adr/ and security.md; open work in GitHub Issues (no tasks.md); LICENSE when the project is distributed; plus .gitignore, .editorconfig and git. Use when the user asks to scaffold, bootstrap, set up or init a project's docs or structure, to make a project "comply" or "follow the standard", to add the missing project files, or invokes /craft:scaffold. Runs a bundled check script and drafts content by reading the repo. It creates missing files right away, and restructures non-compliant existing files only after the user confirms. It never commits.
allowed-tools: Read, Grep, Glob, Edit, Write, Agent, Bash(node ${CLAUDE_PLUGIN_ROOT}/skills/scaffold/scripts/check.mjs:*), Bash(git init:*), Bash(git config --get:*), Bash(git log:*), Bash(git ls-files:*), Bash(ls:*), Bash(mkdir:*)
---

# scaffold — the project knowledge standard

Every project has the same knowledge layout, so any agent or teammate knows where each kind
of knowledge goes. This skill **creates** that layout in a new project and **brings an
existing one into compliance**.

The layout, and when every other skill reads and writes each file, is defined in
`${CLAUDE_PLUGIN_ROOT}/references/project-context.md`; this skill creates and checks it. The
labels, the board and any label-sync tool come from that file's **tracking setup** (§ 2b):
look them up before Step 6, never assume them.

## The standard

| File | Holds | Compliant when |
|---|---|---|
| `README.md` | For users: what/why, install, usage, docs link, license | Exists, has a title and those sections, no stale TODOs |
| `AGENTS.md` | **Canonical** agent file: how to work here + pointers. Never a session log | Links principles, architecture, decisions, security, the repo's issues (and LICENSE if present) |
| `CLAUDE.md` | Shim so Claude Code loads the rules | Contains **only** `@AGENTS.md` and `@principles.md` |
| `principles.md` | Rules every change follows (`P1…`, each with *Why* / *Check*) | Real rules about *this* project; links decisions + architecture |
| `architecture.md` | How it is built: shape, modules, data flow, build/test/deploy | Describes this project, not a template |
| `decisions.md` + `docs/adr/NNNN-*.md` | Why: ADR index + format | Every ADR is indexed, no dangling links, every ADR has a Status. ADR 0001 records this standard |
| GitHub Issues | Open work: one issue per to-do, labelled `type:*` / `priority:*` / `area:*`, on the board the tracking setup names, if any. Finished work closes its issue (`Fixes #N`) | No `tasks.md`; AGENTS.md links the issues; the repo has the shared labels |
| `security.md` | Reporting, surface, secrets, dependencies, known risks | Exists; states the surface, even if it is "none" |
| `LICENSE` | Only when distributed/public | Matches `package.json` `license`; README names it |
| `.gitignore`, `.editorconfig`, `.git` | Repo basics | Present |

Templates live in `${CLAUDE_PLUGIN_ROOT}/skills/scaffold/templates/`. `{{…}}` marks a placeholder.
**Never leave a `{{…}}` in an output file.** Replace it with drafted content, or with
`TODO: <what's needed>` plus a matching follow-up (Step 6). `{{ISSUES_URL}}` is `issues.url`
from the check; with no GitHub remote yet, write `TODO: issues link once the repo is on GitHub`.
`{{BOARD_NOTE}}` is `, also on the [<board name>](<board URL>) board` when the tracking setup
names a board, and nothing otherwise.

## Step 0 — Target

`/craft:scaffold [path]` — defaults to the working directory.

## Step 1 — Check

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/scaffold/scripts/check.mjs <path>
```

The output is JSON facts: file presence and line counts, `entry` (CLAUDE.md imports, whether
it is a shim, extra lines, dated headings that suggest a session log, the links in AGENTS.md
including `agentsLinksIssues`), `adrs` (unindexed, dangling, missing status), `issues` (the
GitHub remote and its issues URL), `legacyTasks` (a `tasks.md` that still exists: its size and
open checkboxes), cross-links, README facts,
license, TODO counts, leftover `{{…}}` `placeholders`, and `basics` (git, gitignore, editorconfig, manifests, `isNew`).

If `node` fails (not installed, or a version-manager shim with no default), don't debug it.
Gather the same facts with Glob/Read/Grep and say the script was skipped.

## Step 2 — Understand the project

- **New** (`basics.isNew`): ask one AskUserQuestion batch covering what it is (one line), the
  stack, whether it is public/distributed or private, and the license (MIT recommended when
  public; none when private). Then draft from the answers.
- **Existing:** read the manifests, entry points, top-level dirs, the scripts/commands, the
  dependencies, env/secret usage (`process.env`, `os.environ`, `.env.example`), auth, network
  endpoints, and file/URL input handling. Read any existing CLAUDE.md/AGENTS.md/README fully,
  because they are the richest source. For a large repo, delegate to **one** Explore agent
  ("medium") and ask it for: shape, modules, data flow, commands, security surface. Mention
  `/xray:onboard` (xray plugin) if the user wants a deep architecture tour.
- License: when `LICENSE` is missing, ask only if the project looks distributed (a public
  remote, `package.json` without `private: true`, a published package). Holder = `git config
  --get user.name`, year = current year. Use the `LICENSE-MIT` template, or write the
  standard text of whichever license the user picks.

## Step 3 — Report (chat)

```
## Scaffold — <name> · <date>

| File | | Note |
|---|---|---|
| AGENTS.md | ❌ | missing — CLAUDE.md holds the content (84 lines) |
| CLAUDE.md | ⚠️ | not a shim; 3 dated headings (session log) |
| security.md | ❌ | missing |
| decisions.md | ⚠️ | 0012 not indexed |
…
Creating now: security.md, .editorconfig
Proposed changes (need your OK): see below
```

✅ compliant · ⚠️ exists but doesn't comply · ❌ missing. Collapse to a single line when
everything is ✅.

## Step 4 — Create what's missing (no confirmation needed)

For each ❌ file, fill its template with drafted content:

- **AGENTS.md:** a one-paragraph summary, the document table, and the working rules as
  written. Real dev commands come from the manifest scripts or Makefile, with one-shot test
  commands and never watch mode. Leave Pitfalls empty unless the existing docs name some.
- **principles.md:** draft only rules the code or existing docs actually show (lint config,
  conventions stated in the old CLAUDE.md, patterns followed everywhere), and cite the
  evidence in *Check*. Always keep the Process rule. Never invent aspirational rules. If you
  find none, write one `TODO` and a follow-up (Step 6) asking the user for them.
- **architecture.md:** fill it from Step 2. Add a Mermaid diagram (per the `diagram`
  skill's conventions) only when there are more than a handful of parts.
- **decisions.md + ADR 0001:** always create ADR 0001 (this standard). If ADRs already
  exist, give this one the next number instead of 0001. Also index existing ADRs.
  Decisions that can be read from history (an old CLAUDE.md, commits) become **Proposed**
  ADRs to list for the user, not Accepted ones, written the way `/craft:adr` writes them
  (its format and rules); offer `/craft:adr` to finish any that need the user's reasons.
- **security.md:** state the real surface. For "none", say why (e.g. "pure library, no I/O").
  Include how to report a vulnerability. For a public GitHub repo, suggest private
  advisories; otherwise add a TODO.
- **README.md:** only if missing. Never rewrite an existing README; list its gaps instead.
- **CLAUDE.md:** create it only when missing; when it exists, the change goes through Step 5.
- **.gitignore:** create it from `gitignore`, then append the ignores for the stacks you
  detected (node_modules/dist, `__pycache__`/.venv, target/…). If `.gitignore` already exists,
  only propose adding what's missing from the base.
- **.editorconfig:** use the template, adjusting `indent_size` to what the code uses.
- **git:** run `git init` when there's no `.git` (for a new project, or after the user
  confirms on an existing one).

## Step 5 — Propose fixes to existing files (apply only on confirm)

Show each proposed change as a short before → after, or as the moved sections. Then use one
AskUserQuestion (apply all / pick / skip) and apply what the user approves.

- **CLAUDE.md has content** → move it to AGENTS.md, splitting by kind. How-to-work,
  commands and pitfalls go to AGENTS.md. Rules go to principles.md. Open work in a session
  log becomes issues (Step 6); finished entries stay in git history (list them in the report);
  decisions in it become Proposed ADRs. Then CLAUDE.md
  becomes the shim. **Nothing is deleted without landing somewhere**; list where each section
  went.
- **AGENTS.md missing links**, **decisions.md missing index lines or with dangling links**,
  **ADR without Status** → make minimal edits that keep the file's existing style.
- **A legacy `tasks.md`** (`legacyTasks` is set) → propose the move to issues, in this order:
  1. When the tracking setup names a tool that syncs labels and migrates `tasks.md`, run it
     the way it says, as a dry run first, and for real only after the user confirms.
     Otherwise queue each open checkbox as an item for `/craft:issue` and push on OK.
  2. Only checkboxes migrate. Read the file for open work written as plain text (ideas,
     "Later" sections, notes under a heading) and propose an issue for each.
  3. Delete `tasks.md` and rewrite every pointer to it (AGENTS/CLAUDE.md rules, principles,
     architecture, README, CONTRIBUTING, PR template, skills that write to it). Accepted ADRs
     stay as they are; a new ADR "Work is tracked in GitHub Issues" supersedes the `tasks.md`
     part of the knowledge ADR, whose status line says so.

  Exception: a project whose `AGENTS.md` says a tool still reads its `tasks.md` keeps it. Say
  so and leave it.
- **LICENSE ≠ package.json `license`** → ask which one is right.

## Step 6 — Follow-ups become issues

Never create a `tasks.md`. Collect one follow-up per TODO left behind and per declined
proposal: **what** — why — where. Dedupe against open issues (`gh issue list`).

- **The repo is on GitHub** (`issues.repo` is set):
  - Queue the follow-ups for `/craft:issue` (kind `chore` or `docs`; body = why and where)
    and push them on the user's OK. It checks the labels, offers to create missing ones, and
    puts each issue on the board when the tracking setup names one.
- **No GitHub remote yet:** the `TODO`s stay in the files. List the follow-ups in the report
  and offer to open them as issues once the repo is on GitHub.

Then re-run `check.mjs` and confirm that everything you touched is now compliant and that
`placeholders` is empty.

## Rules

- Never overwrite or restructure an existing file without confirmation. Creating a missing
  file is fine.
- Match the existing wrapping, heading and list style.
- Don't touch source code, tooling, CI or dependencies; that is out of scope.
- Never commit or push. When the user wants to commit, point them to `/craft:commit-message`.
- Opening issues and running a label or migration tool for real write to GitHub: ask first.
- Finish with one line listing what was created, what was fixed, how many follow-up issues
  were opened (or wait for a GitHub repo), and the suggested next step (e.g. `/craft:maturity` if the project will be
  advertised).
