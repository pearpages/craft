---
type: regex
target:
  source: file
  path: .github/workflows/ci.yml
pattern: "npm run lint"
match: contains
---
