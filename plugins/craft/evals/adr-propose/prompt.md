---
name: adr-propose
tags: [adr]
runs: 1
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:adr skill to record a decision: we cache build results in SQLite instead of Redis, so the tool needs no extra service. The alternatives were Redis (fast, but one more service to run) and no cache (simplest, but builds take twice as long). The cost: SQLite locks under parallel writes. Save it as `docs/adr/0002-sqlite-build-cache.md` and add its index line. This is an automated run: nobody can answer questions, so don't ask; where the skill would ask for my OK, take it as given for the files named here, and never commit, push or call GitHub.
