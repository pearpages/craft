---
type: regex
target:
  source: file
  path: architecture.md
pattern: "test/[\\w.-]*\\.test\\.mjs|boundary|guard|P1"
flags: i
match: contains
---
