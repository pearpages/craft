---
type: regex
target:
  source: file
  path: README.md
pattern: "\\b(delivered|returned|processing)\\b"
flags: i
match: not_contains
---
