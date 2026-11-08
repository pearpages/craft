# 0002. The owner's workflow skills live in craft, a plugin repository of their own

- **Date:** 2026-11-08
- **Status:** Proposed

## Context

The owner's software skills were split: `scaffold`, `issue`, `commit-message`, `maturity` and
`diagram` in the personal settings folder (`~/.claude/skills`), and `onboard`, `check-diagrams`,
`explain-pr` and `features` in xray's plugin. The owner wants one home for them, and two new
skills are coming (an ADR skill, then implement). A public plugin can't read personal files, so a
shared rule set for those skills can't live in the personal folder.

xray's plugin is about analysis: every skill in it reads the code or xray's measurements and
explains them. The workflow skills record choices, track work and ship changes; they use none of
xray's data.

The alternatives were:

1. Keep the split. Nothing moves; the workflow skills stay personal and unshareable.
2. Put them in xray's plugin. One plugin, but `/xray:adr` reads as analysis, and xray's users get
   the owner's way of working with their PR reports.
3. A second plugin inside the xray repository. One repository, but xray stops being only xray.
4. A repository of their own, `craft`, with the `craft` plugin. This is the decision.

## Decision

- **craft** (`pearpages/craft`) is a marketplace with one plugin, `craft`; its skills run as
  `/craft:<skill>`.
- It holds the workflow skills: first `adr`, then, one at a time, the ones that move from the
  personal folder (`scaffold`, `issue`, `commit-message`, `maturity`, `diagram`) and the ones still
  to build (`plan`, `implement`, `wrap-up`). A moved skill is deleted from the personal folder once
  the plugin's copy is installed, so no skill exists twice.
- xray's plugin keeps the analysis skills. Neither plugin needs the other installed; a craft skill
  may read files an xray skill wrote.
- The owner's skills unrelated to software stay in the personal settings folder.

## Consequences

- (+) The workflow skills have one home that can be shared, versioned and reviewed.
- (+) Each prefix says what a skill does: `/xray:` analyses, `/craft:` is the way of working.
- (−) Two plugins to install and update instead of one.
- (−) The skills become public, so personal details in them (the Backlog board, label sets) must
  be generic or come from the project's own `AGENTS.md`.
- (−) Changing a skill needs a push and a plugin update instead of a file edit.
