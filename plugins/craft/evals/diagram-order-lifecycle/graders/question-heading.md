---
type: regex
target:
  source: file
  path: README.md
pattern: "^#{2,4} (How|What|When|Which|Why)\\b[^\\n]*$"
flags: mi
match: contains
---
