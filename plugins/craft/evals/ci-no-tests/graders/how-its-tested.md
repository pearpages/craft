---
type: regex
target:
  source: file
  path: architecture.md
pattern: "^#{2,4} How it(’|')?s tested|^#{2,4} How it is tested"
flags: mi
match: contains
---
