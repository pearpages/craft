---
name: deps-hidden-major
tags: [deps]
runs: 1
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:deps skill on this repo. Last week Dependabot's grouped npm PR bumped jscpd from 4 to 5 together with five small updates, and the whole PR failed its tests. There are no open PRs to look at now: review `.github/dependabot.yml` against the project's rules and fix what let that happen, editing the file. This is an automated run: nobody can answer questions, so don't ask; where the skill would ask for my OK, take it as given for the files named here, and never commit, push or call GitHub.
