#!/usr/bin/env bash
set -euo pipefail
mkdir -p src/core src/cli docs/adr test
cat > AGENTS.md <<'EOF'
# tally
A tiny library that totals invoices, with a CLI on top.

| File | Holds |
|---|---|
| [principles.md](principles.md) | Rules |
| [architecture.md](architecture.md) | How it is built |
| [decisions.md](decisions.md) | ADR index |
| [security.md](security.md) | Security |

Knowledge standard: craft v2 (`/craft:scaffold check` upgrades it)

## Development commands

- `node --test`: run the tests once (Node's built-in runner, files under `test/`).

## Pitfalls that have bitten before
EOF
printf '@AGENTS.md\n@principles.md\n' > CLAUDE.md
cat > principles.md <<'EOF'
# Principles

**P1. `src/core` knows nothing about the CLI or the environment.** It never imports from
`src/cli/` and never reads `process.argv` or `process.env`; the CLI passes everything in.
*Why:* the core is reused by a web app that has no CLI and no environment variables.
*Check:* review.
EOF
cat > architecture.md <<'EOF'
# Architecture

## Modules
| Path | Owns |
|---|---|
| `src/core/` | Invoice totals: `total(lines, { taxRate })`, pure |
| `src/cli/` | Reads arguments and the environment, calls the core, prints |

## Build, test, deploy

### How it's tested
Node's built-in test runner: `node --test` runs `test/*.test.mjs` once.
EOF
cat > decisions.md <<'EOF'
# Decisions

| ADR | Decision | Status | Date |
|---|---|---|---|
EOF
printf '# Security\n\n## Surface\nA CLI that reads its arguments and TALLY_TAX_RATE.\n' > security.md
cat > src/core/total.mjs <<'EOF'
/** Total of invoice lines, tax included. */
export function total(lines, { taxRate }) {
  const net = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  return Math.round(net * (1 + taxRate) * 100) / 100;
}
EOF
cat > src/cli/main.mjs <<'EOF'
import { total } from "../core/total.mjs";
const taxRate = Number(process.env.TALLY_TAX_RATE ?? "0.21");
const lines = JSON.parse(process.argv[2] ?? "[]");
console.log(total(lines, { taxRate }));
EOF
cat > test/total.test.mjs <<'EOF'
import { test } from "node:test";
import assert from "node:assert/strict";
import { total } from "../src/core/total.mjs";
test("adds tax to the lines' total", () => {
  assert.equal(total([{ price: 10, quantity: 2 }], { taxRate: 0.21 }), 24.2);
});
EOF
git init -q -b main && git add -A && git -c user.name=eval -c user.email=eval@example.invalid commit -q -m init
