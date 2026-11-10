---
type: llm
criteria: The plan notices that fetching comments one PR at a time (getPrComments per PR, across every repository) would blow the rate limit in P2 for an org of 300 repositories, and proposes a shape that avoids per-PR calls (GraphQL fetching PRs with their comments in batches, or another batched or paginated approach).
---
