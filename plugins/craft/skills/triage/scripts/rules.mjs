// The triage rules, with no GitHub inside: snapshot.mjs reads each repository once and passes
// the data in. Pure functions of their inputs (the clock is passed in too).

import { keyWords } from '../../issue/scripts/duplicates.mjs';

/**
 * @typedef {{ number: number, title: string, body: string, labels: string[], updatedAt: string, url: string }} Issue
 * @typedef {{ number: number, title: string, body: string, mergedAt: string, url: string }} MergedPr
 * @typedef {{ repo: string, issues: Issue[], mergedPrs: MergedPr[] }} Snapshot  one repository's open issues and recently merged PRs
 * @typedef {{ kind: 'done' | 'duplicate' | 'too-big' | 'stale' | 'label', action: 'close' | 'plan' | 'label',
 *             repo: string, issue: Issue, why: string, evidence?: Issue | MergedPr, label?: string }} Proposal
 */

const STALE_DAYS = 180;
const TOO_BIG_CHECKLIST = 5;
const CLOSES = /\b(?:fix(?:e[sd])?|close[sd]?|resolve[sd]?)\s+#(\d+)\b/gi;
const WAITS_ON = /\b(?:after|blocked by|depends on|needs)\s+#(\d+)\b/gi;
const PRIORITY_RANK = { 'priority:high': 0, 'priority:med': 1, 'priority:low': 2 };
const KIND_WORDS = [
  ['type:bug', /\b(bug|broken|crash(es|ed)?|fails?|failing|wrong|fix|patch|regression|error)\b/i],
  ['type:spike', /\b(investigate|research|explore|spike|decide|compare|evaluate)\b/i],
  ['type:chore', /\b(refactor|upgrade|bump|dependenc(y|ies)|ci|tooling|clean ?up)\b/i],
  ['type:docs', /\b(readme|docs?|document(ation)?|write ?up)\b/i],
];

const numbersIn = (text, pattern) => [...(text ?? '').matchAll(pattern)].map((m) => Number(m[1]));
const daysSince = (iso, now) => (now - new Date(iso)) / 86_400_000;
const priorityOf = (issue) => issue.labels.find((l) => l in PRIORITY_RANK);

/**
 * Same work, judged by key words: at least three shared, or every key word of the shorter title
 * (and at least two). Looser matches are /craft:issue's "maybe" list, not a merge.
 */
function sameWork(a, b) {
  const shared = a.filter((w) => b.includes(w)).length;
  return shared >= 3 || (shared >= 2 && shared === Math.min(a.length, b.length));
}

/** Each issue's older twin, if any, found through an index of key words (no pair-by-pair scan). */
function olderTwins(issues) {
  const words = new Map(issues.map((i) => [i.number, [...new Set(keyWords(i.title))]]));
  const byWord = new Map();
  const twins = new Map();
  for (const issue of [...issues].sort((a, b) => a.number - b.number)) {
    const mine = words.get(issue.number);
    const candidates = new Set(mine.flatMap((w) => byWord.get(w) ?? []));
    const twin = [...candidates].find((older) => sameWork(mine, words.get(older.number)));
    if (twin) twins.set(issue.number, twin);
    for (const w of mine) (byWord.get(w) ?? byWord.set(w, []).get(w)).push(issue);
  }
  return twins;
}

/**
 * Proposals for one repository's backlog, at most one per issue, in this order of precedence:
 * done (a merged PR says it fixes it) → duplicate (an older open issue is the same work) →
 * too-big (five or more open checklist items: a job for /craft:plan) → stale (untouched for
 * 180 days, not high priority, nothing waits on it) → label (no type: label; one is guessed).
 * @param {Snapshot} snapshot
 * @param {{ now: Date, staleDays?: number }} options
 * @returns {{ proposals: Proposal[] }}
 * @example triage({ repo: 'o/r', issues: [#4], mergedPrs: [{ number: 9, body: 'Fixes #4', … }] }, { now })
 *          // → { proposals: [{ kind: 'done', action: 'close', issue: #4, evidence: PR #9, … }] }
 */
export function triage({ repo, issues, mergedPrs }, { now, staleDays = STALE_DAYS }) {
  const fixedBy = new Map();
  for (const pr of mergedPrs) for (const n of numbersIn(`${pr.title}\n${pr.body}`, CLOSES)) if (!fixedBy.has(n)) fixedBy.set(n, pr);
  const open = new Set(issues.map((i) => i.number));
  const waitedOn = new Set(issues.flatMap((i) => numbersIn(i.body, WAITS_ON)).filter((n) => open.has(n)));
  const twins = olderTwins(issues);

  const proposals = [];
  for (const issue of issues) {
    const at = { repo, issue };
    const pr = fixedBy.get(issue.number);
    const twin = twins.get(issue.number);
    const openItems = ((issue.body ?? '').match(/^\s*[-*] \[ \]/gm) ?? []).length;
    if (pr) proposals.push({ ...at, kind: 'done', action: 'close', evidence: pr, why: `PR #${pr.number} was merged and says it fixes #${issue.number}` });
    else if (twin) proposals.push({ ...at, kind: 'duplicate', action: 'close', evidence: twin, why: `same work as the older open #${twin.number}` });
    else if (openItems >= TOO_BIG_CHECKLIST) proposals.push({ ...at, kind: 'too-big', action: 'plan', why: `${openItems} open checklist items: more than one /craft:implement run` });
    else if (daysSince(issue.updatedAt, now) > staleDays && priorityOf(issue) !== 'priority:high' && !waitedOn.has(issue.number))
      proposals.push({ ...at, kind: 'stale', action: 'close', why: `untouched for ${Math.floor(daysSince(issue.updatedAt, now))} days and nothing waits on it` });
    else if (!issue.labels.some((l) => l.startsWith('type:'))) {
      const label = KIND_WORDS.find(([, words]) => words.test(issue.title))?.[0] ?? 'type:feature';
      proposals.push({ ...at, kind: 'label', action: 'label', label, why: `no type: label; the title reads as ${label.slice(5)}` });
    }
  }
  return { proposals };
}

/**
 * The issues to start next, across repositories: open, not about to be closed or planned, and
 * not waiting on another open issue. Highest priority first, then bugs before other kinds, then
 * the oldest.
 * @param {Snapshot[]} snapshots
 * @param {{ now: Date, limit?: number }} options
 * @returns {{ repo: string, issue: Issue, why: string }[]}
 * @example nextUp([snapshot], { now }) // → [{ repo: 'o/r', issue: #3, why: 'priority:high bug, nothing it waits on is open' }]
 */
export function nextUp(snapshots, { now, limit = 3 }) {
  const ready = snapshots.flatMap((snapshot) => {
    const blockedOut = new Set(triage(snapshot, { now }).proposals.filter((p) => p.action !== 'label').map((p) => p.issue.number));
    const open = new Set(snapshot.issues.map((i) => i.number));
    return snapshot.issues
      .filter((i) => !blockedOut.has(i.number) && !numbersIn(i.body, WAITS_ON).some((n) => open.has(n)))
      .map((issue) => ({ repo: snapshot.repo, issue }));
  });
  const rank = ({ issue }) => [PRIORITY_RANK[priorityOf(issue)] ?? 3, issue.labels.includes('type:bug') ? 0 : 1, issue.number];
  ready.sort((a, b) => {
    const [x, y] = [rank(a), rank(b)];
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });
  return ready.slice(0, limit).map(({ repo, issue }) => ({
    repo,
    issue,
    why: `${priorityOf(issue) ?? 'no priority'} ${issue.labels.includes('type:bug') ? 'bug' : (issue.labels.find((l) => l.startsWith('type:'))?.slice(5) ?? 'issue')}, nothing it waits on is open`,
  }));
}
