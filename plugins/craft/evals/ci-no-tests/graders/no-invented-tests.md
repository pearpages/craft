---
type: regex
target:
  source: file
  path: .github/workflows/ci.yml
pattern: "vitest|jest|npm (run )?test"
match: not_contains
---
