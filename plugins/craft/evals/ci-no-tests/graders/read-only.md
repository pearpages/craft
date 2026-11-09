---
type: regex
target:
  source: file
  path: .github/workflows/ci.yml
pattern: "contents:\\s*read"
match: contains
---
