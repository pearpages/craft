# Principles

Every change to this repository, whether code, docs, tests or process, complies with these
rules. When a change would break one, stop and ask the user instead of working around it.
Changing a principle is itself a decision: it needs the user's agreement and an ADR
([decisions.md](decisions.md)). How things are built is in
[architecture.md](architecture.md); security rules in [security.md](security.md).

Each rule has a **Why**, and a **Check** where something enforces it (a test, lint rule,
CI step, hook).

## Skills

**P1. A craft skill is about how a project is built, not about analysing its code.** A skill
that measures or explains code belongs in xray's plugin.
*Why:* each plugin's prefix should say what its skills do; `/xray:` means xray's analysis,
`/craft:` means the way of working. [ADR-0002](docs/adr/0002-craft-plugin-repository.md)
*Check:* review.

**P2. A skill reads only its own plugin's files and the repository it runs on.** No paths into
`~/.claude/skills` or any other personal folder.
*Why:* the plugin is public; anyone who installs it lacks the owner's personal files.
*Check:* review.

**P3. A skill never commits, pushes or opens issues without the user's OK.**
*Why:* those reach other people and can't be quietly undone. *Check:* review; each SKILL.md
states it.

## Process

**P4. Knowledge lives in its file.** How to work → `AGENTS.md`; rules → here; how it is
built → `architecture.md`; why → an ADR; work → GitHub Issues; risk → `security.md`.
*Why:* a session log in the agent file hides decisions from the next person.
[ADR-0001](docs/adr/0001-project-knowledge-files.md)

**P5. A change to what the standard asks of a repository adds a version.** A new file, section
or rule that repositories must follow gets an entry in `plugins/craft/references/standard-changes.md`,
with checkable bullets, in the same commit. A change that asks nothing of repositories doesn't.
*Why:* repositories scaffolded earlier only learn about a change through that file.
[ADR-0003](docs/adr/0003-versioned-knowledge-standard.md) *Check:* review.

## Tests

**P6. A skill's behaviour is pinned by eval cases, and a fixed skill bug adds the check that
would have caught it.** Each skill has at least one case in `plugins/craft/evals/` that runs it on
a small fixture repository and grades what it wrote and said. A fix for a skill that did the
wrong thing comes with an eval case when the bug was in the skill's behaviour, or a unit test
beside the script (`node:test`) when it was in a script's logic, which the eval sandbox can't
reach. *Why:* a skill is instructions, so a wording change can quietly change behaviour; the
lessons ladder (contract § 3c) prefers a check to a note, for craft too.
[ADR-0005](docs/adr/0005-script-bugs-take-unit-tests.md) *Check:* `claude plugin eval
plugins/craft` and `node --test` before pushing a skill change; `/craft:review`.
