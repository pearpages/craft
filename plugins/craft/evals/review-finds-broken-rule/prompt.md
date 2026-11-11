---
name: review-finds-broken-rule
tags: [review]
runs: 3
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:review skill on this branch before I open the PR. It fixes the issue in `ISSUE-4.md`. git and GitHub don't work here, so `CHANGES.md` says what the branch changed; the changed files are in the working tree. This is an automated run: nobody can answer questions, so don't ask, don't fix anything, and don't push or open a PR.
