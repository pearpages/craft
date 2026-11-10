#!/usr/bin/env bash
set -euo pipefail
cat > AGENTS.md <<'MD'
# reviewload
Reports review activity. Issues on GitHub (example/reviewload), labelled `type:*`, `priority:*`, `area:*`. No board.
MD
cat > BACKLOG.md <<'MD'
Open issues in example/reviewload (number · title · labels · last updated · body):

- #2 · Colour the output · type:feature · 2026-03-01 · "Use colours in the table."
- #3 · Crash on a repo with no PRs · type:bug, priority:high · 2026-11-09 · "TypeError when the list is empty."
- #4 · Add a --since flag · type:feature, priority:med · 2026-10-20 · "Only count comments after a date."
- #5 · A plugin API · type:feature · 2026-02-10 · "Let others add report columns."
- #6 · Plugin docs · type:docs, priority:low · 2026-11-01 · "After #5."
- #7 · The table breaks with long names · (no labels) · 2026-11-05 · "Names over 40 characters push the columns."
- #8 · Org-wide report · type:feature, priority:med · 2026-11-02 · "- [ ] list repos\n- [ ] batch comments\n- [ ] page results\n- [ ] new table\n- [ ] docs\n- [ ] CI job"
- #18 · Upgrade jscpd from 4 to 5 · type:chore, priority:med · 2026-10-01 · "Major bump."
- #22 · Add a --json flag to the CLI · type:feature, priority:low · 2026-10-15 · "Machine-readable output."
- #30 · Upgrade jscpd to version 5 · type:chore · 2026-11-08 · "jscpd 5 is out."
- #31 · Add a --quiet flag to the CLI · type:feature, priority:low · 2026-11-07 · "No progress output."

Merged PRs (newest 200), the ones that mention issues:
- #15 · feat: --since flag · merged 2026-11-03 into `next` (not the default branch) · "Adds --since.\n\nFixes #4"
- #16 · refactor: prepare the table for #7 · merged 2026-11-06 · "Groundwork for #7, which still needs the fix."
MD
