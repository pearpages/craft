---
name: plan-hidden-scale
tags: [plan]
runs: 1
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:plan skill to plan this idea: "reviewload should show, for every open PR across all the org's repositories, how many review comments it has and who wrote them, so team leads see who is overloaded." This is an automated run: nobody can answer questions, so don't ask, and don't create issues or call GitHub; just give the spec and the slices you would file.
