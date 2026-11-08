---
name: commit-message
description: Write a sensible git commit message that matches the repository's existing convention, then commit. Use when the user asks to commit, to name/write a commit message, or invokes /craft:commit-message. Inspects the staged diff and recent history, drafts a message (mirroring the repo's convention, or Conventional Commits when the repo has none), shows it for confirmation, then commits — staged changes only, no co-author trailer.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Read
---

# commit-message — write a sensible commit message and commit

Name a commit well. A good message says **what changed and why** in the shape the
repository already uses, so its history stays consistent and skimmable.

**Scope:** operates on **staged** changes only. Always **propose the message and wait
for confirmation before committing**. **Never** add a `Co-Authored-By` or any AI/Claude
trailer. Does not push, branch, or bump versions.

Before starting, follow `${CLAUDE_PLUGIN_ROOT}/references/project-context.md`. For this skill
that means reading `AGENTS.md` for a stated commit convention; nothing else.

## Step 1 — Check preconditions

Confirm you're in a git repo and see what's staged:

```bash
git diff --cached --stat
```

- **Something staged** → continue to Step 2.
- **Nothing staged** → run `git status --short`, show the user the unstaged/untracked
  files, and **stop to ask** whether to stage them (`git add …`). Never stage-all or
  commit unstaged work on your own.

## Step 2 — Understand the change

Read the actual staged diff, not just filenames:

```bash
git diff --cached          # the change itself
git diff --cached --stat   # its shape / size
```

Work out the **primary intent** and the **"why"**, not just the mechanical "what". Use
`Read` on a changed file only if the diff alone is ambiguous. If the staged diff mixes
**clearly unrelated concerns** (e.g. a bugfix + an unrelated refactor), say so and
**offer** to split it into separate commits — but don't force it; the user may want one.

## Step 3 — Detect the repository's convention

The message must look like it belongs in this repo. Read recent history:

```bash
git log --oneline -30
```

A convention stated in `AGENTS.md` wins over what history suggests. Otherwise infer the
house style:

- **Conventional Commits?** Do subjects start with a `type:` or `type(scope):` prefix?
  Which types actually appear?
- **Casing** — lowercase subjects vs sentence case.
- **Scopes** — used or never used?
- **Length** — how long subjects typically run.
- **Bodies** — do commits have multi-line bodies, or subject-only?
- **Trailers** — any (e.g. `Refs:`)? (You still never add a co-author trailer.)

**Mirror what you find.** If history is empty, tiny, or inconsistent, **default to
Conventional Commits**: a lowercase, concise subject, no trailing period.

Conventional Commit types for the fallback:

| Type       | Use for                                             |
| ---------- | --------------------------------------------------- |
| `feat`     | a new feature / capability                          |
| `fix`      | a bug fix                                           |
| `refactor` | restructuring without behavior change               |
| `docs`     | documentation only                                  |
| `style`    | formatting/whitespace, no code-behavior change      |
| `test`     | adding or fixing tests                              |
| `chore`    | tooling, deps, config, housekeeping                 |
| `perf`     | a performance improvement                           |
| `build`    | build system or dependencies                        |
| `ci`       | CI configuration                                    |

## Step 4 — Craft the message

- **Subject** mirrors the detected style: correct type, scope **only if the repo uses
  scopes**, matching casing and tense, concise (aim ~50 chars, hard limit 72), no
  trailing period. Summarize the primary intent — specific, not vague ("fix null check
  in date parser", not "fix bug").
- **Body** — add a short body **only** when the change is non-trivial *and* the repo's
  history uses bodies, or the "why" isn't obvious from the subject. Wrap at ~72 columns;
  explain motivation/consequences, not a line-by-line restatement of the diff.
- **Issues:** when the change finishes a GitHub issue (the branch name, the conversation or
  the diff says which), offer `Fixes #N` in the body, so the commit closes it.
- **Never** append a `Co-Authored-By`, `Generated with`, or any AI/Claude trailer.

## Step 5 — Propose

Show the exact message you intend to use in a fenced block, and invite edits:

```text
<the proposed subject>

<optional body>
```

**Wait for explicit confirmation** (or an edited version) before committing.

## Step 6 — Commit

On approval, commit the staged changes on the **current branch** (do not create a
branch):

```bash
git commit -m "<subject>"                 # subject only
git commit -m "<subject>" -m "<body>"     # with a body
```

Report the result — short hash and subject (`git log -1 --oneline`). Do **not** push.
