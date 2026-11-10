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
- `node --test`: run the tests once.
MD
cat > principles.md <<'MD'
# Principles
**P1. Only `src/db/` runs SQL.** Everything else calls its functions. *Check:* review.
MD
cat > architecture.md <<'MD'
# Architecture
| Path | Owns |
|---|---|
| `src/db/orders.mjs` | `ordersFor(customerId)`, `itemsFor(orderId)`: one query each |
| `src/orders/` | What the back office shows about orders |

A busy customer has up to 2,000 orders.
MD
cat > ISSUE-7.md <<'MD'
# #7 Show each order with its items on the customer page
1. `customerOrders(customerId)` returns every order of the customer with its items.
2. A test covers it.
MD
cat > src/db/orders.mjs <<'JS'
export const makeOrdersDb = (sql) => ({
  ordersFor: (customerId) => sql`select * from orders where customer_id = ${customerId}`,
  itemsFor: (orderId) => sql`select * from items where order_id = ${orderId}`,
});
JS
cat > src/orders/service.mjs <<'JS'
// The branch's new code.
export class OrderService {
  constructor(db) { this.db = db; }
  getOrders(customerId) { return this.db.ordersFor(customerId); }
  getItems(orderId) { return this.db.itemsFor(orderId); }
}
JS
cat > src/orders/customer-orders.mjs <<'JS'
// The branch's new code.
import { OrderService } from './service.mjs';
/** Every order of a customer, each with its items. */
export async function customerOrders(db, customerId) {
  const service = new OrderService(db);
  const orders = await service.getOrders(customerId);
  const result = [];
  for (const order of orders) result.push({ ...order, items: await service.getItems(order.id) });
  return result;
}
JS
cat > test/customer-orders.test.mjs <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { customerOrders } from '../src/orders/customer-orders.mjs';
test('returns each order with its items', async () => {
  const db = { ordersFor: async () => [{ id: 1 }, { id: 2 }], itemsFor: async (id) => [{ sku: `s${id}` }] };
  assert.deepEqual(await customerOrders(db, 9), [{ id: 1, items: [{ sku: 's1' }] }, { id: 2, items: [{ sku: 's2' }] }]);
});
JS
cat > CHANGES.md <<'MD'
Branch feat/7-customer-orders, against main. Added: src/orders/service.mjs, src/orders/customer-orders.mjs,
test/customer-orders.test.mjs. Nothing else changed. `node --test` passes.
MD
