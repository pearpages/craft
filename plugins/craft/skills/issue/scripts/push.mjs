#!/usr/bin/env node
// Push the /craft:issue queue to GitHub in one go. Zero dependencies; every GitHub call goes
// through `gh` with an argument array (no shell), and bodies go in on stdin.
//
//   node push.mjs --check   # print possible duplicates for every queued item, create nothing
//                           # (lists each repo's issues once; the rules are in duplicates.mjs)
//   node push.mjs           # create every queued item, empty the queue
//   node push.mjs --board 3 --owner @me   # …and put each one on that project board
//
// Queue: ~/.cache/issue/queue.json → { "items": [ { repo, kind, priority?, area?, title, body } ] }
// Items that fail stay in the queue, so running it again retries only those.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { findMatches } from './duplicates.mjs';

const QUEUE = join(homedir(), '.cache/issue/queue.json');
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const BOARD = arg('--board'); // a project number; no board when absent
const OWNER = arg('--owner') ?? '@me';
const LIST_LIMIT = 1000; // newest issues read per repo by --check; older ones aren't compared

function gh(args, input) {
  for (let attempt = 1; ; attempt++) {
    try {
      return execFileSync('gh', args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (error) {
      const stderr = String(error.stderr ?? '');
      if (attempt > 2 || !/\b50[234]\b/.test(stderr)) throw Object.assign(error, { stderr });
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000 * attempt);
    }
  }
}

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const queue = JSON.parse(readFileSync(QUEUE, 'utf8'));
const items = queue.items ?? [];

const checking = process.argv.includes('--check');
// The duplicate check needs only a repo and a title; creating needs every field.
const gaps = items.filter((i) => !i.repo || !i.title || (!checking && (!i.kind || !i.body)));
if (gaps.length) {
  console.error(`Fill the gaps first (repo, kind, title, body): ${gaps.map((i) => i.title ?? '(untitled)').join('; ')}`);
  process.exit(1);
}

if (checking) {
  // List each repo's issues once (open and closed). Not --search: GitHub's search index lags a
  // fresh issue, so pushing a queue twice in a row filed duplicates (craft#8).
  const listed = new Map();
  const issuesOf = (repo) => {
    if (!listed.has(repo)) {
      try {
        listed.set(repo, { issues: JSON.parse(gh(['issue', 'list', '--repo', repo, '--state', 'all',
          '--limit', String(LIST_LIMIT), '--json', 'number,title,state,url'])) });
      } catch (error) {
        listed.set(repo, { error: String(error.stderr ?? error.message).trim() });
      }
    }
    return listed.get(repo);
  };
  let unlisted = 0;
  for (const [n, item] of items.entries()) {
    const { issues, error } = issuesOf(item.repo);
    let found;
    if (error) {
      unlisted++;
      found = `couldn't list ${item.repo}'s issues (${error}); check by hand or run --check again`;
    } else {
      found = findMatches(item.title, issues).map((h) => `#${h.number} [${h.state}] ${h.title}`).join(' · ') || 'none';
    }
    console.log(`${n + 1}. ${item.repo} — ${item.title}\n   matches: ${found}`);
  }
  process.exit(unlisted ? 1 : 0);
}

const failed = [];
for (const [n, item] of items.entries()) {
  const labels = [`type:${item.kind}`, item.priority && `priority:${item.priority}`, item.area && `area:${item.area}`]
    .filter(Boolean).flatMap((l) => ['--label', l]);
  try {
    const url = gh(['issue', 'create', '--repo', item.repo, '--title', item.title, ...labels, '--body-file', '-'], item.body).trim();
    if (BOARD) {
      try {
        gh(['project', 'item-add', BOARD, '--owner', OWNER, '--url', url]);
      } catch (error) {
        if (!String(error.stderr).includes('already exists in this project')) {
          console.log(`${n + 1}. ${item.repo} | ${item.title} | ${url} | NOT on the board: ${String(error.stderr).trim()}`);
          continue;
        }
      }
    }
    console.log(`${n + 1}. ${item.repo} | ${item.title} | ${url}`);
  } catch (error) {
    failed.push(item);
    console.log(`${n + 1}. ${item.repo} | ${item.title} | FAILED: ${String(error.stderr ?? error.message).trim()}`);
  }
  sleep(1000); // stay under GitHub's content-creation rate limit
}

writeFileSync(QUEUE, JSON.stringify({ items: failed }, null, 2) + '\n');
console.log(failed.length ? `${failed.length} failed and stay in the queue.` : 'Queue empty.');
process.exit(failed.length ? 1 : 0);
