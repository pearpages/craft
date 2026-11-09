---
type: regex
target:
  source: file
  path: src/core/total.mjs
pattern: "process\\.|src/cli|\\.\\./cli"
match: not_contains
---
