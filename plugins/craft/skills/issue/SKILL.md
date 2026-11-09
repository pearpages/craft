---
name: issue
description: Create GitHub issues the house way — queue many, push them all at once, right repo, kind/priority/area labels, on the user's project board when they have one, never twice. Use when asked to open, create, file or log an issue (a bug, fix, feature, spike or to-do), to migrate notes, a list or a file into issues, at the end of a session for new to-dos, or on /craft:issue.
---

# issue — queue issues, then push them all at once

Every issue lands in the right repo with a **kind**, on the user's project board when they
have one, and exists once. Work in two moves: **queue** (fast, no questions) and **push** (one
round of questions, one confirmation, one command).

Before starting, follow `${CLAUDE_PLUGIN_ROOT}/references/project-context.md`. Its **tracking
setup** (§ 2b) gives the labels and says where the board and any label-sync tool come from:
the project's `AGENTS.md`, then the user's own instructions, else no board. Look it up once
per push; never assume a board, owner or local path.

The **queue** is `~/.cache/issue/queue.json`:
`{ "items": [ { "repo", "kind", "priority"?, "area"?, "title", "body" } ] }`. It survives
between sessions. `scripts/push.mjs` next to this file reads it.

| The user says | Do |
|---|---|
| `/craft:issue <items>` (or "add …", "also …") | Queue them, show the queue. Ask nothing. |
| `/craft:issue push` (or "push", "send them") | Push: Steps 2–4. |
| `/craft:issue <items> now` | Queue them, then push straight away. |
| `/craft:issue` alone | Show the queue; with an empty queue, ask what to add. |
| "drop 3", "change 2 to a bug" | Edit the queue, show it. |

## Step 1 — Queue

Split the input into **items**, one per piece of work: a checkbox, a bullet, a numbered line,
or a paragraph that asks for something. Headings and intro lines are **context**: they go
into the body of the items under them. Done lines (`- [x]`, "Done") are not items.

Fill what the input settles (tables below) and leave the rest empty. Add the items to the
queue file and show the whole queue: `# | repo | kind | priority | area | title`, with `?`
for a gap. End with one line: "Add more, or say push."

| Field | Required | Where it comes from |
|---|---|---|
| repo | yes | Named in the request or the item; a sibling project folder of the current repo (read its `git remote get-url origin`: a folder may not match the repo name) or `gh repo list`. Otherwise the current repo. |
| kind | yes | The item's words → the table below. |
| priority | no | Said outright ("urgent", "someday", "blocks X") → `high`, `med` or `low`. |
| area | no | Obvious from the item → `ui`, `api`, `infra` or `dx`. |
| title | yes | Short, imperative, in the repo's language (a Catalan repo gets a Catalan title). |
| body | yes | What, why, where (files, links, a related ADR or issue), the context lines, and "Done when …". |

| Words in the item | Kind |
|---|---|
| bug, broken, fails, wrong, fix, patch, regression | `bug` |
| add, new, build, support, feature | `feature` |
| investigate, research, explore, spike, decide, compare | `spike` |
| refactor, upgrade, dependencies, CI, tooling, clean up | `chore` |
| README, docs, document, write up | `docs` |

A **gap** is a required field the input does not settle: a repo that could be two projects, a
kind the words don't decide ("look at the map": bug or spike?), a body with no "what".

## Step 2 — Push: resolve every gap in one round

Ask one AskUserQuestion round for the whole queue: one question per field with gaps, grouped
("Which repo for items 3 and 7?", "Kind for item 5?"), plus one multi-select "Which are high
priority?" over the items with no priority. Fold what the answers settle into the queue.

Done when every item has a repo, a kind, a title and a body.

## Step 3 — Push: check duplicates, preview, confirm

Run `node ${CLAUDE_PLUGIN_ROOT}/skills/issue/scripts/push.mjs --check`. It lists each item's repo's issues
once (open and closed, the newest 1,000), not through search, which misses an issue created
seconds ago, and prints up to four that share the title's key words. It exits 1 when a repo couldn't be
listed; those items say why, so check them by hand. An **open** match that is the same work makes
the item a duplicate: drop it and note the link. A **closed** match is worth a note
(reopen instead?).

Show the final table `# | repo | kind | priority | area | title | note` and ask once: push
all, drop some, or edit. Every repo must have the `type:*` labels (`gh label list --repo
<repo>`). A repo without them isn't set up: when the tracking setup names a
label-sync tool, offer to run it the way it says (a dry run first, then for real on OK);
otherwise offer to create the missing labels with `gh label create`, on OK.

## Step 4 — Push: create them all

Write the confirmed queue to the file, then run
`node ${CLAUDE_PLUGIN_ROOT}/skills/issue/scripts/push.mjs`, adding `--board <number> --owner
<owner>` when the tracking setup names a board. It creates every issue (the body goes in on
stdin), puts each on the board when one is given (an auto-add workflow getting there first
counts as done), retries GitHub's 502/503/504, and leaves only the failures in the queue.

Done when the script prints "Queue empty." Report `# | repo | title | URL`. If some failed,
say why, fix the cause, and run it again: it retries only those.

## Migrating from a file

After the push, offer to remove the migrated items from the source file, showing exactly
which lines. Remove them only on a yes. A project whose `AGENTS.md` says a tool still reads its
`tasks.md` keeps that file as it is.
