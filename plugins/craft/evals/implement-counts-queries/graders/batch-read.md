---
type: regex
target:
  source: file
  path: src/db/orders.mjs
pattern: "any\\s*\\(|\\bin\\s*\\(|join\\s+items|sql\\(\\s*\\w*ids"
flags: i
match: contains
---
