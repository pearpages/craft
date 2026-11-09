# Project context contract

The single, project-agnostic source of truth for **where a project keeps its knowledge** and
**when a skill reads or writes each file**. `/craft:scaffold` creates and checks this layout;
every other craft skill follows it. A skill opts in with one line near its top:

> Before starting, follow `${CLAUDE_PLUGIN_ROOT}/references/project-context.md`.

The project's own `AGENTS.md` wins over this file wherever they disagree.

## 0. Is the context there?

Look for `AGENTS.md` at the repo root.

- **Present** → follow this contract.
- **Missing** → say "This project has no context files; `/craft:scaffold` sets them up." Then
  continue only if the user says so, reading whatever docs exist (README, an old CLAUDE.md)
  and writing nothing back to context files.

## 1. The files

| File | Holds | A skill reads it when | A skill writes it when |
|---|---|---|---|
| `AGENTS.md` | How to work here: commands, conventions, labels, pitfalls, pointers | Always (a session already has it via the `CLAUDE.md` shim; a subagent must read it) | A new pitfall or a changed command. Never a session log |
| `principles.md` | Rules every change follows (`P1…`, *Why* / *Check*) | Always before changing code or docs (already loaded via the shim) | Only on the user's agreement, with an ADR |
| `architecture.md` | How it is built: modules, data flow, build, deploy | Planning, implementing, explaining or reviewing anything structural | In the same commit as a structural or behavioural change |
| `decisions.md` + `docs/adr/` | Why: one ADR per real choice, indexed | Before a choice that may already be decided; when a change touches an area an ADR covers | A choice between real alternatives → a **Proposed** ADR + an index line. The user accepts it. Never edit an accepted ADR; supersede it |
| `security.md` | Threat surface, secrets, dependency policy, reporting | Anything touching auth, secrets, input handling, network or dependencies | When that surface changes; `craft:security diff` finds the change |
| GitHub Issues (+ milestones) | Open work, labelled `type:*` / `priority:*` / `area:*`, on the board the tracking setup names (§ 2b); milestones are the roadmap | Planning, picking work, avoiding duplicates | Through `/craft:issue` only. Finished work closes its issue with `Fixes #N` |
| `README.md` | For users: what, why, install, usage | Explaining the project to someone outside it | When users can see the change |
| `vision.md` *(optional, proposed)* | What it is for, who it is for, goals, non-goals | Planning, prioritising, judging maturity | When the direction changes, on the user's word |
| `GLOSSARY.md` *(optional, proposed)* | The project's own terms | Naming things; writing docs, issues or PRs | When a new term is agreed |

Optional files are read **if present**; a skill never fails or nags because one is missing
(`/craft:scaffold` and `/craft:maturity` are the only ones that report it).

## 2. Reading rules

- Read by need, not by habit: the table's "reads it when" column, nothing more. A commit
  message needs `AGENTS.md`, not the ADRs.
- Read the ADR index (`decisions.md`) first, then only the ADRs it points to for the area.
- A subagent does not inherit the session's loaded files: hand it the paths it needs.

## 2b. Tracking setup: labels and board

The labels are `type:` `bug` / `feature` / `spike` / `chore` / `docs`, `priority:` `high` /
`med` / `low`, and `area:` `ui` / `api` / `infra` / `dx`. Where issues are also put on a project
board, and which tool keeps the labels in sync, is personal to each user, so a skill looks it up,
in this order:

1. **The project's `AGENTS.md`**: a board linked in its Issues row, or named labels.
2. **The user's own instructions** (their `~/.claude/CLAUDE.md`): a line such as "Backlog board:
   `<owner>` project `<number>`" and "Label sync and board scripts: `<path to a workflow repo>`".
3. **Neither**: no board. Missing labels are created with `gh label create`, on the user's OK.

A skill never hard-codes a board, an owner or a local path.

## 3. Writing rules

- **Route by kind** (the "knowledge lives in its file" rule): how to work → `AGENTS.md`;
  rules → `principles.md`; how it is built → `architecture.md`; why → an ADR; work → an
  issue; risk → `security.md`.
- Ask before writing to `principles.md`, accepting an ADR, or anything outward-facing
  (issues, pushes, PRs, releases).
- Match the file's existing style; make the smallest edit that keeps it true.
- Never create `tasks.md`, never write a session summary into any context file.

## 3b. Personal memory: the admission test

Before saving anything to the agent's personal memory, ask: **would a different developer on
this project need this to do the work correctly?**

- **Yes** → it is a project decision (codebase, architecture, product, convention). Route it by
  § 3 instead; at most leave a one-line memory pointing at the file.
- **No** → it is about how this user wants the agent to work or report. A personal memory is
  the right home.

A memory dense with paths, symbols or class names is almost always a project decision.

## 3c. Lessons: where a mistake goes

A mistake is worth something only if it can't happen the same way again. Put its lesson on the
**lowest rung that prevents it**:

| Rung | Form | When |
|---|---|---|
| 1. Check | A test, lint rule, hook or CI step | A machine can detect it. Strongest: nobody has to remember |
| 2. Rule | A `principles.md` entry, *Why* = the incident, *Check* = how it's caught; an ADR when there was a real choice | A judgement no check can make, that every change must follow |
| 3. Pitfall | `AGENTS.md` Pitfalls, as *symptom → cause → fix* | A trap to recognise: a misleading error, a tool's quirk |
| Personal | A feedback memory | About how the user wants the agent to work, not the project (§ 3b) |

- **Climb on a repeat.** A pitfall that bites twice becomes a rule or a check; a rule broken
  again needs a check.
- **Every fix asks where its lesson goes.** A `fix:` commit or a closed `type:bug` issue leaves a
  regression test, a rule, a pitfall, or an explicit "nothing to learn".
- **Prefer enforcing to writing.** A principle whose *Check* is only "review" is a candidate for
  rung 1; propose the check as an issue.
- The moments a lesson shows up: the user corrects the agent, a fix lands, a command or doc
  misled, the same question is asked twice. `craft:wrap-up` collects them.

## 4. Which skill reads and writes what

| Skill | Reads | Writes |
|---|---|---|
| `craft:scaffold` | everything (creates it) | every file, on the rules in its own SKILL.md |
| `craft:maturity` | everything | issues (via `craft:issue`) |
| `craft:issue` | `AGENTS.md` (labels, board), `vision.md` for priority | issues |
| `craft:commit-message` | `AGENTS.md` (commit convention) | — |
| `craft:adr` | `AGENTS.md`, `decisions.md`, the ADRs it points to, `GLOSSARY.md`, `principles.md` | `docs/adr/`, `decisions.md` |
| `craft:diagram`, `xray:check-diagrams` | `architecture.md` | `architecture.md` diagrams (on OK) |
| `xray:onboard` | `AGENTS.md`, `architecture.md` | `docs/onboarding/` |
| `xray:explain-pr`, `xray:features` | `architecture.md`, `GLOSSARY.md` | — / `xray.features.json` |
| plan *(to build)* | `vision.md`, `decisions.md`, `architecture.md`, issues | a spec, issues, a milestone |
| implement *(to build)* | `AGENTS.md` Pitfalls, `principles.md`, `architecture.md`, relevant ADRs, `security.md` when relevant | code, `architecture.md`, Proposed ADRs |
| review *(to build)* | `AGENTS.md` Pitfalls, `principles.md`, `security.md` (via `craft:security diff`), the issue | findings; a fix without its lesson (§ 3c) is one |
| merge & release *(to build)* | `AGENTS.md` (release steps), the versioning ADR | closed issues, tags, release notes |
| `craft:security` | `security.md`, the ADRs on security or dependencies, the diff (or the repo for `audit`) | `security.md` (on OK), issues (via `craft:issue`) |
| `craft:deps` | `decisions.md` and ADRs (version limits), `security.md` (policy), `AGENTS.md` (commands), the update PRs | `.github/dependabot.yml`, `security.md` Dependencies, a branch for a major (all on OK) |
| `craft:wrap-up` | `git status` of every repo the session touched, the conversation, open issues, `AGENTS.md` Pitfalls (repeats, § 3c) | issues (via `craft:issue`), ADRs (via `craft:adr`), any context file on OK |

xray's skills are listed for completeness; they don't opt in to this file.

## 5. Ownership

- This file defines the layout; `craft:scaffold`'s table and `craft:maturity`'s checks point here
  instead of keeping their own copies.
- Changing this contract changes how every craft skill works: agree it with the user first.
