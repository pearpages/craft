---
type: regex
target:
  source: file
  path: test/customer-orders.test.mjs
pattern: "count|calls\\b|\\.length\\s*,\\s*[0-9]|queries"
flags: i
match: contains
---
