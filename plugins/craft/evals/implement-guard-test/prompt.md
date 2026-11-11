---
name: implement-guard-test
tags: [implement]
runs: 3
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:implement skill on this issue (there is no GitHub here, so here is its text):

> **#7 Test that src/core never imports the CLI nor reads process.argv or process.env.**
> P1's *Check* is review only. Add a test that fails when a file in `src/core/` imports from
> `src/cli/`, or reads `process.argv` or `process.env`, and point P1's *Check* at it.

Read the code with a plain text or regex scan inside the test; no new dependencies. This is an automated run: nobody can answer questions, so don't ask, and take any OK the skill needs for this design as given. Never commit, push or call GitHub.
