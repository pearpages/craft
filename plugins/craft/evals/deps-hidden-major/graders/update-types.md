---
type: regex
target:
  source: file
  path: .github/dependabot.yml
pattern: "update-types:[^\\n]*minor[^\\n]*patch|update-types:[^\\n]*patch[^\\n]*minor"
match: contains
---
