---
type: regex
target:
  source: file
  path: .github/dependabot.yml
pattern: "dependency-name:\\s*\"?typescript"
match: contains
---
