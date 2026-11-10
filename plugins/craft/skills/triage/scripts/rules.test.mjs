// The triage rules, tested without GitHub: node --test "plugins/craft/skills/*/scripts/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextUp, triage } from './rules.mjs';

const NOW = new Date('2026-11-10T12:00:00Z');
const daysAgo = (n) => new Date(NOW - n * 86_400_000).toISOString();
const issue = (number, title, { labels = ['type:feature'], body = '', updated = 5 } = {}) =>
  ({ number, title, body, labels, updatedAt: daysAgo(updated), url: `https://github.com/o/r/issues/${number}` });
const pr = (number, title, body = '') => ({ number, title, body, mergedAt: daysAgo(1), url: `https://github.com/o/r/pull/${number}` });
const snapshot = (issues, mergedPrs = []) => ({ repo: 'o/r', issues, mergedPrs });
const kinds = (result) => result.proposals.map((p) => [p.kind, p.issue.number]);

test('an open issue a merged PR says it fixes is done', () => {
  const result = triage(snapshot([issue(4, 'Add a --since flag')], [pr(9, 'feat: --since', 'Adds the flag.\n\nFixes #4')]), { now: NOW });
  assert.deepEqual(kinds(result), [['done', 4]]);
  assert.equal(result.proposals[0].evidence.number, 9);
});

test('a PR that only mentions an issue does not make it done', () => {
  const result = triage(snapshot([issue(4, 'Add a --since flag')], [pr(9, 'feat: groundwork', 'Prepares #4.')]), { now: NOW });
  assert.deepEqual(kinds(result), []);
});

test('the newer of two open issues about the same work is the duplicate', () => {
  const result = triage(snapshot([
    issue(18, 'Upgrade jscpd from 4 to 5'),
    issue(30, 'Upgrade jscpd to version 5'),
  ]), { now: NOW });
  assert.deepEqual(kinds(result), [['duplicate', 30]]);
  assert.equal(result.proposals[0].evidence.number, 18);
});

test('issues that only share a word or two are not duplicates', () => {
  const result = triage(snapshot([issue(22, 'Add a --json flag to the CLI'), issue(31, 'Add a --quiet flag to the CLI')]), { now: NOW });
  assert.deepEqual(kinds(result), []);
});

test('an issue untouched for six months is stale, unless it is high priority or another issue waits on it', () => {
  const result = triage(snapshot([
    issue(2, 'Colour the output', { updated: 200 }),
    issue(3, 'Support Windows paths', { updated: 200, labels: ['type:bug', 'priority:high'] }),
    issue(5, 'A plugin API', { updated: 200 }),
    issue(6, 'Plugin docs', { body: 'After #5.' }),
  ]), { now: NOW });
  assert.deepEqual(kinds(result), [['stale', 2]]);
});

test('an issue with no type label gets one guessed from its title', () => {
  const result = triage(snapshot([issue(7, 'The report crashes when the map is empty', { labels: [] })]), { now: NOW });
  assert.deepEqual(kinds(result), [['label', 7]]);
  assert.equal(result.proposals[0].label, 'type:bug');
});

test('an issue with five or more open checklist items is too big for one implement run', () => {
  const body = ['- [ ] parse', '- [ ] fetch', '- [ ] page', '- [ ] render', '- [ ] docs', '- [x] spike'].join('\n');
  const result = triage(snapshot([issue(8, 'Org-wide report', { body })]), { now: NOW });
  assert.deepEqual(kinds(result), [['too-big', 8]]);
});

test('an issue gets at most one proposal: done wins over everything else', () => {
  const result = triage(snapshot([issue(4, 'Something', { labels: [], updated: 400 })], [pr(9, 'fix', 'Closes #4')]), { now: NOW });
  assert.deepEqual(kinds(result), [['done', 4]]);
});

test('next up: ready issues by priority, then bugs before features, then the oldest; blocked and closing ones left out', () => {
  const snapshots = [snapshot([
    issue(1, 'Low feature', { labels: ['type:feature', 'priority:low'], updated: 10 }),
    issue(2, 'High feature', { labels: ['type:feature', 'priority:high'], updated: 3 }),
    issue(3, 'High bug', { labels: ['type:bug', 'priority:high'], updated: 1 }),
    issue(4, 'Blocked high bug', { labels: ['type:bug', 'priority:high'], body: 'after #2' }),
    issue(5, 'Done already', { labels: ['type:bug', 'priority:high'] }),
    issue(6, 'Med feature', { labels: ['type:feature', 'priority:med'], updated: 50 }),
  ], [pr(9, 'fix', 'Fixes #5')])];
  const picks = nextUp(snapshots, { now: NOW });
  assert.deepEqual(picks.map((p) => p.issue.number), [3, 2, 6]);
  assert.match(picks[0].why, /high/);
});

test('one pass over the issues, whatever their number', () => {
  // The rules index the issues once; 2,000 issues must not take quadratic time.
  const many = Array.from({ length: 2000 }, (_, i) => issue(i + 1, `Distinct topic number ${i} alpha${i} beta${i}`));
  const started = performance.now();
  triage(snapshot(many), { now: NOW });
  assert.ok(performance.now() - started < 1000, 'triage of 2,000 issues stays under 1 s');
});
