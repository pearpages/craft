# 0005. A bug in a script's logic is pinned by a unit test, not an eval case

- **Date:** 2026-11-09
- **Status:** Accepted — chosen by the owner on 2026-11-09

## Context

P6 said every fixed skill bug adds an eval case. craft#8 was a bug in `/craft:issue`'s script
(its duplicate check searched GitHub instead of listing), and an eval case couldn't reach it: the
eval sandbox has no GitHub, no working git and no Node from mise. The fix came with unit tests
instead (ADR-0004), and the first run of `/craft:review` flagged it as breaking P6.

The alternatives were:

1. Keep P6 as it was and write an eval case anyway. It could only test the parts of the skill
   that don't touch GitHub, so it wouldn't have caught the bug.
2. Let the fix's kind decide the check: a bug in what a skill *does* (its instructions) takes an
   eval case; a bug in a script's logic takes a unit test beside the script. This is the
   decision.
3. Drop the "fixed bug adds a check" half of P6. The lessons ladder would then rest on review.

## Decision

- P6 now reads: a fixed skill bug adds the check that would have caught it: an eval case when the
  bug is in the skill's behaviour, a unit test (`node:test`, ADR-0004) when it is in a script's
  logic.
- "Every skill has at least one eval case" stays.

## Consequences

- (+) Each fix gets a check that can actually fail on it.
- (+) `/craft:review` has an unambiguous rule to review against.
- (−) A bug that spans a skill's instructions and its script needs both.
