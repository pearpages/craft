---
name: triage-backlog
tags: [triage]
runs: 1
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:triage skill on example/reviewload, and tell me what to start next. GitHub and Node don't work in this sandbox, so `BACKLOG.md` has what `gh` would list today (2026-11-10). This is an automated run: nobody can answer questions, so don't ask, and don't close, label or comment on anything; show the table you'd ask me to approve.
