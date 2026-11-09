#!/usr/bin/env bash
set -euo pipefail
mkdir -p src/core src/cli
cat > AGENTS.md <<'EOF'
# tally
Totals invoices; a CLI on top of a pure core.

| File | Holds |
|---|---|
| [principles.md](principles.md) | Rules |
| [architecture.md](architecture.md) | How it is built |
| [README.md](README.md) | For users |

## Development commands

- `node --test`: run the tests once.
EOF
cat > principles.md <<'EOF'
# Principles

**P1. `src/core` never reads the environment.** It never reads `process.env` or `process.argv`;
the CLI reads them and passes values in. *Why:* the core is reused by a web app.
*Check:* review.
EOF
cat > architecture.md <<'EOF'
# Architecture
| Path | Owns |
|---|---|
| `src/core/` | `total(lines, { taxRate })`, pure |
| `src/cli/` | Arguments, environment, printing |
EOF
cat > README.md <<'EOF'
# tally
## Usage
`tally '<lines json>'` prints the total. `TALLY_TAX_RATE` sets the tax rate.
EOF
cat > ISSUE-4.md <<'EOF'
# #4 Add a --verbose flag
1. `tally --verbose` prints how long the total took, after the total.
2. Document `--verbose` in the README's Usage section.
EOF
# The branch's change, as it stands in the working tree:
cat > src/core/total.mjs <<'EOF'
export function total(lines, { taxRate }) {
  const started = Date.now();
  const net = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const result = Math.round(net * (1 + taxRate) * 100) / 100;
  if (process.env.TALLY_VERBOSE) console.error(`took ${Date.now() - started}ms`);
  return result;
}
EOF
cat > src/cli/main.mjs <<'EOF'
import { total } from "../core/total.mjs";
const args = process.argv.slice(2);
if (args.includes("--verbose")) process.env.TALLY_VERBOSE = "1";
const lines = JSON.parse(args.find((a) => !a.startsWith("--")) ?? "[]");
console.log(total(lines, { taxRate: Number(process.env.TALLY_TAX_RATE ?? "0.21") }));
EOF
cat > CHANGES.md <<'EOF'
Branch feat/4-verbose, against main. Changed: src/core/total.mjs (timing, printed when
TALLY_VERBOSE is set), src/cli/main.mjs (--verbose sets TALLY_VERBOSE). Nothing else changed.
EOF
