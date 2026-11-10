---
name: commit-mirrors-convention
tags: [commit-message]
runs: 1
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:commit-message skill to write the commit message for what I've staged. git doesn't work in this sandbox, so `GIT-STATE.md` has what `git status`, `git diff --cached` and `git log --oneline` print right now. This is an automated run: nobody can answer questions, so don't ask, and don't commit; show the message you'd ask me to confirm.
