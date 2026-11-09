---
name: scaffold-upgrade
tags: [scaffold]
runs: 1
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:scaffold skill to check this repo against the standard (check mode). Report only: don't change any file. This is an automated run: nobody can answer questions, so don't ask; where the skill would ask for my OK, take it as given for the files named here, and never commit, push or call GitHub.
