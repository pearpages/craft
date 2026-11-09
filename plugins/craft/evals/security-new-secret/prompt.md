---
name: security-new-secret
tags: [security]
runs: 1
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:security skill in diff mode: check this branch against main. Report only: don't change any file. This is an automated run: nobody can answer questions, so don't ask; where the skill would ask for my OK, take it as given for the files named here, and never commit, push or call GitHub.
