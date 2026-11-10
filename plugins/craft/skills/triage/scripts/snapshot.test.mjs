// Reading a repository for triage, with a fake `gh` that counts its calls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSnapshots } from './snapshot.mjs';

/** A fake `gh`: answers `issue list` and `pr list` from canned data, and counts every call. */
function fakeGh({ issues = 1, prs = 1, failRepo } = {}) {
  const calls = [];
  const run = (args) => {
    calls.push(args);
    const repo = args[args.indexOf('--repo') + 1];
    if (repo === failRepo) throw Object.assign(new Error('gh failed'), { stderr: 'HTTP 404: Not Found' });
    if (args[0] === 'issue') return JSON.stringify(Array.from({ length: issues }, (_, i) => ({
      number: i + 1, title: `Issue ${i}`, body: '', labels: [{ name: 'type:bug' }], updatedAt: '2026-11-01T00:00:00Z', url: `u${i}` })));
    return JSON.stringify(Array.from({ length: prs }, (_, i) => ({ number: 1000 + i, title: 'pr', body: '', mergedAt: '2026-11-01T00:00:00Z', url: `p${i}` })));
  };
  return { run, calls };
}

test('two gh calls per repository, whether it has 1 issue or 1,000 (no N+1)', () => {
  for (const issues of [1, 1000]) {
    const gh = fakeGh({ issues, prs: issues });
    readSnapshots(['o/a', 'o/b'], { run: gh.run });
    assert.equal(gh.calls.length, 4, `${issues} issues per repo`);
  }
});

test('labels come back as names, ready for the rules', () => {
  const { snapshots } = readSnapshots(['o/a'], { run: fakeGh().run });
  assert.deepEqual(snapshots[0].issues[0].labels, ['type:bug']);
  assert.equal(snapshots[0].repo, 'o/a');
});

test('a repository that cannot be read is reported, and the others still are', () => {
  const { snapshots, failures } = readSnapshots(['o/a', 'o/gone'], { run: fakeGh({ failRepo: 'o/gone' }).run });
  assert.deepEqual(snapshots.map((s) => s.repo), ['o/a']);
  assert.deepEqual(failures, [{ repo: 'o/gone', error: 'HTTP 404: Not Found' }]);
});

test('every call is an argument array to gh, never a shell string', () => {
  const gh = fakeGh();
  readSnapshots(['o/a; rm -rf ~'], { run: gh.run });
  assert.ok(gh.calls.every((args) => Array.isArray(args) && args.includes('o/a; rm -rf ~')));
});
