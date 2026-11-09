// The duplicate check's rules, tested without GitHub: node --test plugins/craft/skills
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findMatches, keyWords } from './duplicates.mjs';

const issue = (number, title, state = 'OPEN') => ({ number, title, state, url: `https://github.com/o/r/issues/${number}` });

test('an issue created seconds ago is a match (craft#8)', () => {
  // GitHub's search index lags a fresh issue; a listed issue is there at once.
  const justCreated = issue(9, 'Build /craft:plan: an idea to a short spec, linked issues and a milestone');
  const matches = findMatches('Build /craft:plan: an idea to a short spec', [justCreated]);
  assert.deepEqual(matches.map((m) => m.number), [9]);
});

test('closed issues match too, so the user can reopen instead', () => {
  const matches = findMatches('Upgrade jscpd to 5', [issue(18, 'Upgrade jscpd from 4 to 5', 'CLOSED')]);
  assert.deepEqual(matches.map((m) => [m.number, m.state]), [[18, 'CLOSED']]);
});

test('at most four matches, the most shared key words first', () => {
  const issues = [
    issue(1, 'eval case for ci'),
    issue(2, 'eval case for deps hidden major'),
    issue(3, 'hidden major in deps groups eval'),
    issue(4, 'deps triage'),
    issue(5, 'deps setup'),
    issue(6, 'nothing in common here'),
  ];
  const matches = findMatches('Eval case: deps hidden major', issues);
  assert.equal(matches.length, 4);
  assert.deepEqual(matches.slice(0, 2).map((m) => m.number), [2, 3]);
  assert.ok(!matches.some((m) => m.number === 6));
});

test('no shared key word, no match', () => {
  assert.deepEqual(findMatches('Deploy skill for sites', [issue(1, 'Upgrade jscpd from 4 to 5')]), []);
});

test('key words skip short and common words, ignore case and punctuation', () => {
  assert.deepEqual(keyWords('Fix: the /craft:issue duplicate check, on GitHub'), ['craft', 'issue', 'duplicate', 'check', 'github']);
});
