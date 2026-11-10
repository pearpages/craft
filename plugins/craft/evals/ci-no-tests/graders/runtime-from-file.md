---
type: regex
target:
  source: file
  path: .github/workflows/ci.yml
pattern: "node-version-file|jdx/mise-action|mise\\.toml"
match: contains
---
