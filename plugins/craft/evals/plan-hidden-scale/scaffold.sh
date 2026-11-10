#!/usr/bin/env bash
set -euo pipefail
mkdir -p src docs/adr
cat > AGENTS.md <<'MD'
# reviewload
A CLI that reports review activity for one GitHub repository. `node src/cli.js <owner/repo>`.

| File | Holds |
|---|---|
| [principles.md](principles.md) | Rules |
| [architecture.md](architecture.md) | Modules |
| [decisions.md](decisions.md) | ADR index |

## Development commands
- `node --test`: run the tests once.
MD
cat > principles.md <<'MD'
# Principles
**P1. Only `src/github.js` talks to GitHub.** Everything else gets data passed in.
*Why:* the report logic is tested without the network.
**P2. A report run stays inside GitHub's rate limit (5,000 requests an hour) for an org of 300 repositories.**
*Why:* the team leads run it from CI every hour.
MD
cat > architecture.md <<'MD'
# Architecture
- `src/cli.js`: parses the argument, calls `github.js`, passes the data to `report.js`, prints.
- `src/github.js`: `listOpenPrs(repo)` (one REST call) and `getPrComments(repo, number)` (one REST call per PR).
- `src/report.js`: pure; `summarise(prs, commentsByPr)` → rows per author.
MD
cat > decisions.md <<'MD'
# Decisions
| ADR | Decision | Status | Date |
|---|---|---|---|
| [0001](docs/adr/0001-rest-client.md) | Plain fetch against GitHub's API, no SDK | Accepted | 2026-02-01 |
MD
cat > docs/adr/0001-rest-client.md <<'MD'
# 0001. Plain fetch against GitHub's API, no SDK
- **Status:** Accepted
## Decision
`src/github.js` uses `fetch` with a token; no Octokit. GraphQL is allowed through the same module.
MD
cat > src/github.js <<'JS'
const API = 'https://api.github.com';
const get = (path, token) => fetch(`${API}${path}`, { headers: { authorization: `Bearer ${token}` } }).then((r) => r.json());
export const listOpenPrs = (repo, token) => get(`/repos/${repo}/pulls?state=open&per_page=100`, token);
export const getPrComments = (repo, number, token) => get(`/repos/${repo}/pulls/${number}/comments?per_page=100`, token);
JS
cat > src/report.js <<'JS'
/** @returns {{ author: string, comments: number }[]} */
export function summarise(prs, commentsByPr) {
  const counts = new Map();
  for (const pr of prs) for (const c of commentsByPr.get(pr.number) ?? []) counts.set(c.user.login, (counts.get(c.user.login) ?? 0) + 1);
  return [...counts].map(([author, comments]) => ({ author, comments })).sort((a, b) => b.comments - a.comments);
}
JS
cat > src/cli.js <<'JS'
import { listOpenPrs, getPrComments } from './github.js';
import { summarise } from './report.js';
const [repo] = process.argv.slice(2);
const token = process.env.GITHUB_TOKEN;
const prs = await listOpenPrs(repo, token);
const commentsByPr = new Map();
for (const pr of prs) commentsByPr.set(pr.number, await getPrComments(repo, pr.number, token));
console.table(summarise(prs, commentsByPr));
JS
