#!/usr/bin/env node
// Read-only backlog triage. Reads each repository with two `gh` calls (snapshot.mjs), applies
// the rules (rules.mjs) and prints proposals; it changes nothing on GitHub.
//
//   node triage.mjs --repo owner/a [--repo owner/b …]          # proposals, then the next three
//   node triage.mjs --repo owner/a --next [--limit 5]          # only what to start next
//   node triage.mjs --repo owner/a --json                      # the same as JSON, for the skill
//
// Exits 1 when a repository couldn't be read (the others are still triaged).

import { nextUp, triage } from './rules.mjs';
import { readSnapshots } from './snapshot.mjs';

const args = process.argv.slice(2);
const repos = args.flatMap((a, i) => (a === '--repo' ? [args[i + 1]] : []));
const limit = Number(args[args.indexOf('--limit') + 1]) || 3;
if (!repos.length) {
  console.error('Name at least one repository: --repo owner/name');
  process.exit(2);
}

const now = new Date();
const { snapshots, failures } = readSnapshots(repos);
const proposals = args.includes('--next') ? [] : snapshots.flatMap((s) => triage(s, { now }).proposals);
const next = nextUp(snapshots, { now, limit });

if (args.includes('--json')) {
  const slim = ({ issue, evidence, ...rest }) => ({ ...rest, number: issue.number, title: issue.title, url: issue.url,
    ...(evidence && { evidence: { number: evidence.number, title: evidence.title, url: evidence.url } }) });
  console.log(JSON.stringify({ proposals: proposals.map(slim), next: next.map(slim), failures }, null, 2));
} else {
  for (const p of proposals) console.log(`${p.repo}#${p.issue.number}\t${p.kind}\t${p.action}${p.label ? ` ${p.label}` : ''}\t${p.issue.title}\t${p.why}`);
  if (!args.includes('--next')) console.log(proposals.length ? '' : 'No proposals.');
  console.log('Next up:');
  for (const [i, n] of next.entries()) console.log(`${i + 1}. ${n.repo}#${n.issue.number} ${n.issue.title} (${n.why})`);
  for (const f of failures) console.log(`Couldn't read ${f.repo}: ${f.error}`);
}
process.exit(failures.length ? 1 : 0);
