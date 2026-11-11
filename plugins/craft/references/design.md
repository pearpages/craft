# Design: deep modules, and data access that doesn't grow with the data

Shared by `/craft:plan` (decides it), `/craft:implement` (builds and tests it) and
`/craft:review` (checks it). The project's own principles and ADRs win where they say more.

## Scalable means deep modules

A module is **deep** when a small interface hides a lot of work: callers ask for what they need
in the domain's words and don't have to know how it's done. It is **shallow** when its interface
is about as big as what it hides, so every caller pays the cost of learning it and gets little
for it.

- **The right amount of information:** an entry point takes what the caller knows and returns
  what the caller needs, nothing it has to assemble itself and no knobs nobody uses. Its doc
  comment says what it does, its inputs, outputs and errors, with a short example; its errors
  say what went wrong and what to do (developer experience).
- **Shallow signs** (each a design smell): a wrapper that only forwards to another call; a getter
  or setter per field; a class per step of one process; an interface that mirrors one
  implementation; options that expose how it works; callers that must call three things in the
  right order.
- **An interface where it pays:** at the outside world (database, network, files, clock,
  randomness, processes), so the core is tested with one fake; or where a second implementation
  exists today. Elsewhere, plain functions and data.
- **A fake is only as good as its match with the real thing.** One contract test suite runs
  against both the fake and the real implementation, wherever the real one can run in a test (a
  temporary database, folder or git repo). Where it can't, say so: the fake is then a guess.
- **A module owns its state.** No module-level variables that other modules change, no hidden
  global config: settings and shared resources are passed in. Coupling through state doesn't show
  in an import graph.
- **Deepen as you go.** A change that must extend a shallow module deepens it (merges the
  forwarding wrapper into its caller, adds the batch entry point) as part of the change. Waiting
  for "a refactor later" means it never happens; only unrelated clean-ups are out of scope.

## Performant means no N+1

An **N+1** is one query (or HTTP call, or file read) for a list, then one more per item: 50
orders, 51 queries. It hides well, because each line looks right and tests with fakes don't feel
the cost.

- **Data access is shaped for sets.** The module that reads data takes a list:
  `commentsFor(prIds)`, `ordersWithItems(customerId)`, not `commentFor(prId)` called in a loop. It
  hides the join, the `IN (…)`, the batched GraphQL query, the paging. A per-item entry point that
  already exists is a reason to add the batch one, not to loop over it.
- **A query budget for every step that reads data:** the number of queries or calls as a
  constant, independent of how many items there are ("2 queries for any number of orders"; "one
  call per 100 PRs"). Where the count must grow, say how (per page, per repository) and why.
- **A test counts them.** The fake behind the data interface counts its calls, or the real test
  database logs its queries (preferred when it can run: a fake's count proves the core asks once,
  not that the adapter's own query is one), and the test asserts the budget with **two sizes** of data (say 1 and
  50 items): the same count for both proves nothing grows per item. Use the stack's tool when it
  has one: Django `assertNumQueries`, Rails `bullet` or `assert_queries_count`, ActiveRecord or
  Prisma / Drizzle / Sequelize query events, SQLAlchemy event listeners, a counting `fetch` for
  HTTP.
- **Also watch:** a query inside a `map` or `for`, lazy-loaded relations read in a loop (ORM
  `include` / `select_related` / `prefetch_related` missing), awaiting calls one by one that could
  be one batch, and re-reading what was already loaded.
