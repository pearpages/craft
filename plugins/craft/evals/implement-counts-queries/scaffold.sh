#!/usr/bin/env bash
set -euo pipefail
mkdir -p src/orders src/db test
cat > AGENTS.md <<'MD'
# shopdesk
The back office of a small shop. Node, Postgres through `src/db/`.

| File | Holds |
|---|---|
| [principles.md](principles.md) | Rules |
| [architecture.md](architecture.md) | How it is built |

## Development commands
- `node --test`: run the tests once. Tests live in `test/<name>.test.mjs` and pass a plain object
  with the db functions instead of a real database.
MD
cat > principles.md <<'MD'
# Principles
**P1. Only `src/db/` runs SQL.** Everything else receives the db functions and calls them. *Check:* review.
MD
cat > architecture.md <<'MD'
# Architecture
| Path | Owns |
|---|---|
| `src/db/orders.mjs` | `ordersFor(customerId)`, `itemsFor(orderId)`: one query each |
| `src/orders/` | What the back office shows about orders |

A busy customer has up to 2,000 orders.
MD
cat > src/db/orders.mjs <<'JS'
/** The orders queries. `sql` is the tagged-template client from `postgres`. */
export const makeOrdersDb = (sql) => ({
  ordersFor: (customerId) => sql`select * from orders where customer_id = ${customerId}`,
  itemsFor: (orderId) => sql`select * from items where order_id = ${orderId}`,
});
JS
