#!/usr/bin/env bash
set -euo pipefail
git_remote_note='origin: https://github.com/example/xray (git does not work in this sandbox)'
cat > AGENTS.md <<MD
# xray
Analyses pull requests. ${git_remote_note}.

## Tracking
Issues on GitHub, labelled \`type:*\`, \`priority:*\`, \`area:*\`. No project board.
MD
cat > LABELS.md <<'MD'
type:bug, type:feature, type:spike, type:chore, type:docs, priority:high, priority:med, priority:low, area:ui, area:api, area:infra, area:dx
MD
cat > CHECK-OUTPUT.md <<'MD'
What `node push.mjs --check` prints for the queue (example/xray, 4 items):

1. "Fix: the report crashes when the feature map is empty"
   no match
2. "Investigate whether to bundle the Action instead of building it on every run"
   #9  closed  "Spike: bundle the Action with esbuild"  https://github.com/example/xray/issues/9
3. "Upgrade jscpd to 5"
   #18 open    "Upgrade jscpd from 4 to 5"  https://github.com/example/xray/issues/18
4. "Add a --quiet flag to the CLI"
   #22 open    "Add a --json flag to the CLI"  https://github.com/example/xray/issues/22
MD
