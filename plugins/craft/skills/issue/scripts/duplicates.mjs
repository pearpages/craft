// The duplicate check's rules, with no GitHub inside: push.mjs lists the issues and passes them in.

const STOP = new Set('a an the to of in on for and or with from is be it its as at by fix add'.split(' '));
const MAX_MATCHES = 4;

/**
 * The words of a title that say what it's about: lower-case letters and digits, longer than two
 * characters, without common words.
 * @param {string} title
 * @returns {string[]} e.g. keyWords('Fix: the /craft:issue duplicate check') → ['craft', 'issue', 'duplicate', 'check']
 */
export function keyWords(title) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/**
 * @typedef {{ number: number, title: string, state: string, url: string }} Issue
 *
 * Issues that may already be the queued one: open or closed, sharing at least one key word with
 * its title, the most shared words first (then the newest), at most four.
 * @param {string} title the queued issue's title
 * @param {Issue[]} issues every issue of its repository, as listed (not searched: a search misses
 *   issues created seconds ago)
 * @returns {Issue[]} e.g. findMatches('Upgrade jscpd to 5', [{ number: 18, title: 'Upgrade jscpd from 4 to 5', … }]) → [#18]
 */
export function findMatches(title, issues) {
  const wanted = new Set(keyWords(title));
  return issues
    .map((issue) => ({ issue, shared: keyWords(issue.title).filter((w) => wanted.has(w)).length }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || b.issue.number - a.issue.number)
    .slice(0, MAX_MATCHES)
    .map(({ issue }) => issue);
}
