#!/usr/bin/env bash
set -euo pipefail
cat > AGENTS.md <<'MD'
# shopdesk
A small order desk. Work is tracked in GitHub Issues. Docs: README.md.
MD
cat > README.md <<'MD'
# shopdesk

A small order desk for a one-person shop.

## Orders

An order is created when a customer checks out. The rules for what can happen to it next are in
`src/orders/status.mjs`.

## Install

```bash
npm install
```
MD
mkdir -p src/orders src/payments
cat > src/orders/status.mjs <<'JS'
// Which status an order can move to, and on what event. Anything else is rejected.
export const TRANSITIONS = {
  pending: { pay: 'paid', cancel: 'cancelled' },
  paid: { ship: 'shipped', refund: 'refunded' },
  shipped: {},
  cancelled: {},
  refunded: {},
};

export function next(status, event) {
  const to = TRANSITIONS[status]?.[event];
  if (!to) throw new Error(`can't ${event} an order that is ${status}`);
  return to;
}
JS
cat > src/orders/service.mjs <<'JS'
import { next } from './status.mjs';
import { charge, refund } from '../payments/gateway.mjs';

export async function pay(order) {
  await charge(order.total);
  return { ...order, status: next(order.status, 'pay') };
}

export async function refundOrder(order) {
  await refund(order.total);
  return { ...order, status: next(order.status, 'refund') };
}
JS
cat > src/payments/gateway.mjs <<'JS'
export async function charge(amount) { return { ok: true, amount }; }
export async function refund(amount) { return { ok: true, amount }; }
JS
