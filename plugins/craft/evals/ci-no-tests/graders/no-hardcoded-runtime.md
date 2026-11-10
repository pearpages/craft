---
type: regex
target:
  source: file
  path: .github/workflows/ci.yml
pattern: "node-version:\\s*['\"]?\\d|node:\\s*\\[\\s*['\"]?\\d"
match: not_contains
---
