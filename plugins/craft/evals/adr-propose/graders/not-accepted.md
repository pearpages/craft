---
type: regex
target:
  source: file
  path: docs/adr/0002-sqlite-build-cache.md
pattern: "Status:\\**\\s*Accepted"
flags: i
match: not_contains
---
