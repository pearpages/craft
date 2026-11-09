---
type: llm
criteria: |
  The answer shows the guard was proven to catch violations, not just written: it was checked
  against a sample that breaks the rule in several ways (and against the real core breaking it for
  a moment, where it could run). The eval sandbox may have no working Node or git; then the answer
  says plainly what it could not run and gives the exact commands to run instead, and any proof
  it did run (another JS runtime, the scan logic alone) is reported as such, not as a pass. It
  reports that P1's Check now points at the test, and it does not commit.
---
