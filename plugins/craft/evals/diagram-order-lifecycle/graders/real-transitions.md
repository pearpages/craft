---
type: regex
target:
  source: file
  path: README.md
pattern: "(?=[\\s\\S]*pending\\s*-->\\s*paid)(?=[\\s\\S]*pending\\s*-->\\s*cancelled)(?=[\\s\\S]*paid\\s*-->\\s*shipped)(?=[\\s\\S]*paid\\s*-->\\s*refunded)"
flags: i
match: contains
---
