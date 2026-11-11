---
name: implement-counts-queries
tags: [implement]
runs: 3
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Bash, Write, Edit]
---
Use the craft:implement skill on this issue (there is no GitHub here, so here is its text):

> **#7 Show each order with its items on the customer page.**
> Add `customerOrders(db, customerId)` in `src/orders/customer-orders.mjs`: every order of the
> customer, each with its items. Test it in `test/customer-orders.test.mjs`.

This is an automated run: nobody can answer questions, so don't ask, and take any OK the skill needs for this design as given. Never commit, push or call GitHub.
