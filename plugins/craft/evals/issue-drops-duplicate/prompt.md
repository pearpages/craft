---
name: issue-drops-duplicate
tags: [issue]
runs: 1
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:issue skill: queue these, then get them ready to push:
- Fix: the report crashes when the feature map is empty
- Investigate whether to bundle the Action instead of building it on every run
- Upgrade jscpd to 5
- Add a --quiet flag to the CLI

GitHub and Node don't work in this sandbox, so `CHECK-OUTPUT.md` has what `push.mjs --check` would print for this queue, and `LABELS.md` what `gh label list` shows. This is an automated run: nobody can answer questions, so don't ask, and don't push or create anything; show the final table you would ask me to confirm.
