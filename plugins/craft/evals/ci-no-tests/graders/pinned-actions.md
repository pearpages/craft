---
type: regex
target:
  source: file
  path: .github/workflows/ci.yml
pattern: "uses:\\s*[\\w./-]+(@(main|master|latest|HEAD))?\\s*(#.*)?$"
flags: m
match: not_contains
---
