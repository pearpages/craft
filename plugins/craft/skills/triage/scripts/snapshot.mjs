// The only part of triage that talks to GitHub: two `gh` calls per repository, however many
// issues it has. The rules live in rules.mjs.

import { execFileSync } from 'node:child_process';

const ISSUE_LIMIT = 1000; // newest open issues read per repository
const PR_LIMIT = 200; // newest merged PRs read per repository: enough to find what fixed an open issue

/** Runs `gh` with an argument array (no shell) and returns its stdout. */
export const runGh = (args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/**
 * One snapshot per repository: its open issues and its recently merged PRs, as plain data.
 * @param {string[]} repos `owner/name`
 * @param {{ run?: (args: string[]) => string }} [deps] how to call `gh`; tests pass a fake
 * @returns {{ snapshots: import('./rules.mjs').Snapshot[], failures: { repo: string, error: string }[] }}
 *   a repository that can't be read (no access, renamed, gh not signed in) is a failure, not a throw
 * @example readSnapshots(['pearpages/xray']) // → { snapshots: [{ repo, issues: [...], mergedPrs: [...] }], failures: [] }
 */
export function readSnapshots(repos, { run = runGh } = {}) {
  const snapshots = [];
  const failures = [];
  for (const repo of repos) {
    try {
      const issues = JSON.parse(run(['issue', 'list', '--repo', repo, '--state', 'open', '--limit', String(ISSUE_LIMIT),
        '--json', 'number,title,body,labels,updatedAt,url']));
      const mergedPrs = JSON.parse(run(['pr', 'list', '--repo', repo, '--state', 'merged', '--limit', String(PR_LIMIT),
        '--json', 'number,title,body,mergedAt,url']));
      snapshots.push({ repo, issues: issues.map((i) => ({ ...i, labels: i.labels.map((l) => l.name) })), mergedPrs });
    } catch (error) {
      failures.push({ repo, error: String(error.stderr ?? error.message).trim() });
    }
  }
  return { snapshots, failures };
}
