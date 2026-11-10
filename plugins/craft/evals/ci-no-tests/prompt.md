---
name: ci-no-tests
tags: [ci]
runs: 1
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:ci skill to set up CI for this repo: write `.github/workflows/ci.yml` and update `architecture.md`. Instead of opening issues, list the issues you would open. This is an automated run: nobody can answer questions, so don't ask; where the skill would ask for my OK, take it as given for the files named here, and never commit, push or call GitHub.
