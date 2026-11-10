---
name: release-breaking-major
tags: [release]
runs: 1
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:release skill: what should the next release be, and what would its notes say? `RELEASE-STATE.md` has what git and GitHub would show. This is an automated run: nobody can answer questions, so don't ask, and don't tag, push or publish anything; just propose.
