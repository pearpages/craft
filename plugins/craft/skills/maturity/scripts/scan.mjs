#!/usr/bin/env node
// Mechanical facts about a repo for the /craft:maturity skill. Facts only — no scoring.
// Usage: node scan.mjs [repoPath]   → JSON on stdout. Zero dependencies.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const SKIP = new Set(['node_modules', 'dist', '.git', 'build', 'coverage', '.next', 'test-results', '.turbo', '.vercel']);
const MAX_DEPTH = 5;

function walk(dir, depth = 0, out = []) {
  if (depth > MAX_DEPTH) return out;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, depth + 1, out);
    else out.push(p);
  }
  return out;
}

const rel = (p) => relative(root, p);
const read = (p) => {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return null;
  }
};

function lastCommit(p) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', rel(p)], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
  } catch {
    return null;
  }
}

function fileFact(p) {
  if (!p || !existsSync(p)) return { present: false };
  const text = read(p) ?? '';
  return { present: true, path: rel(p), lines: text.split('\n').length, bytes: statSync(p).size, lastCommit: lastCommit(p) };
}

// Case-insensitive lookup of a file in the repo root.
const rootNames = readdirSync(root);
function atRoot(...names) {
  const lower = names.map((n) => n.toLowerCase());
  const hit = rootNames.find((n) => lower.includes(n.toLowerCase()));
  return hit ? join(root, hit) : null;
}
function atRootPrefix(prefix) {
  const hit = rootNames.find((n) => n.toLowerCase().startsWith(prefix.toLowerCase()));
  return hit ? join(root, hit) : null;
}

const files = walk(root);

// --- knowledge files ---------------------------------------------------------
const adrDirs = ['docs/adr', 'docs/adrs', 'docs/decisions', 'adr', 'doc/adr'].map((d) => join(root, d)).filter(existsSync);
const adrs = adrDirs.flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.md')).map((f) => join(rel(d), f)));

const knowledge = {
  claudeMd: fileFact(atRoot('CLAUDE.md')),
  agentsMd: fileFact(atRoot('AGENTS.md')),
  architecture: fileFact(atRoot('architecture.md', 'ARCHITECTURE.md') ?? (existsSync(join(root, 'docs/architecture.md')) ? join(root, 'docs/architecture.md') : null)),
  principles: fileFact(atRoot('principles.md', 'PRINCIPLES.md') ?? (existsSync(join(root, 'docs/principles.md')) ? join(root, 'docs/principles.md') : null)),
  decisions: fileFact(atRoot('decisions.md', 'DECISIONS.md') ?? (existsSync(join(root, 'docs/decisions.md')) ? join(root, 'docs/decisions.md') : null)),
  adr: { dirs: adrDirs.map(rel), count: adrs.length, files: adrs },
  tasks: fileFact(atRoot('tasks.md', 'TASKS.md', 'TODO.md')),
  readme: fileFact(atRoot('README.md', 'readme.md')),
  license: fileFact(atRootPrefix('LICENSE') ?? atRootPrefix('LICENCE')),
  changelog: fileFact(atRoot('CHANGELOG.md')),
};

// --- community ---------------------------------------------------------------
const gh = join(root, '.github');
const community = {
  contributing: fileFact(atRoot('CONTRIBUTING.md') ?? (existsSync(join(gh, 'CONTRIBUTING.md')) ? join(gh, 'CONTRIBUTING.md') : null)),
  security: fileFact(atRoot('SECURITY.md') ?? (existsSync(join(gh, 'SECURITY.md')) ? join(gh, 'SECURITY.md') : null)),
  codeOfConduct: fileFact(atRoot('CODE_OF_CONDUCT.md') ?? (existsSync(join(gh, 'CODE_OF_CONDUCT.md')) ? join(gh, 'CODE_OF_CONDUCT.md') : null)),
  issueTemplates: existsSync(join(gh, 'ISSUE_TEMPLATE')),
  prTemplate: ['pull_request_template.md', 'PULL_REQUEST_TEMPLATE.md'].some((f) => existsSync(join(gh, f))),
};

// --- README content ----------------------------------------------------------
let readme = null;
if (knowledge.readme.present) {
  const text = read(join(root, knowledge.readme.path));
  const headings = [...text.matchAll(/^#{1,3} (.+)$/gm)].map((m) => m[1].trim());
  const images = [...text.matchAll(/!\[[^\]]*\]\(([^)]+)\)|<img[^>]+src="([^"]+)"/g)].map((m) => m[1] ?? m[2]);
  const badges = images.filter((s) => /shields\.io|badge|badgen|github\.com\/.+\/actions/.test(s));
  const firstImageLine = text.split('\n').findIndex((l) => /!\[|<img/.test(l));
  readme = {
    headings,
    imageCount: images.length,
    badges,
    firstImageLine: firstImageLine === -1 ? null : firstImageLine + 1,
    hasInstall: /npm (i|install)|pnpm add|yarn add|pip install|cargo add|go get/.test(text),
    hasCodeExample: /```(tsx?|jsx?|js|ts|bash|sh|python|py)?\n/.test(text),
    links: [...new Set([...text.matchAll(/https?:\/\/[^\s)"'>]+/g)].map((m) => m[0]))].slice(0, 40),
    staleMarkers: [...text.matchAll(/\b(TODO|TBD|FIXME|coming soon|WIP)\b/gi)].length,
  };
}

// --- package.json ------------------------------------------------------------
let pkg = null;
const pkgPath = join(root, 'package.json');
if (existsSync(pkgPath)) {
  try {
    const p = JSON.parse(read(pkgPath));
    const publishable = Boolean(p.name) && !p.private && Boolean(p.files || p.exports || p.main || p.module);
    pkg = {
      publishable,
      name: p.name ?? null,
      version: p.version ?? null,
      private: Boolean(p.private),
      license: p.license ?? null,
      description: p.description ?? null,
      keywords: p.keywords ?? [],
      repository: p.repository ?? null,
      homepage: p.homepage ?? null,
      bugs: p.bugs ?? null,
      author: p.author ?? null,
      type: p.type ?? null,
      exports: p.exports ?? null,
      main: p.main ?? null,
      types: p.types ?? p.typings ?? null,
      files: p.files ?? null,
      sideEffects: p.sideEffects ?? null,
      engines: p.engines ?? null,
      peerDependencies: p.peerDependencies ?? null,
      workspaces: p.workspaces ?? null,
      scripts: p.scripts ?? {},
      publishConfig: p.publishConfig ?? null,
    };
  } catch (err) {
    pkg = { error: `package.json unreadable: ${err.message}` };
  }
}

// --- docs site: CNAME + HTML meta --------------------------------------------
const cname = files
  .filter((f) => basename(f) === 'CNAME')
  .map((f) => ({ path: rel(f), domain: (read(f) ?? '').trim() }));

function metaOf(html, attr, key) {
  const re = new RegExp(`<meta[^>]*${attr}=["']${key.replace(/[:.]/g, '\\$&')}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  if (!tag) return null;
  const m = tag.match(/content=(["'])([\s\S]*?)\1/i);
  return m ? m[2] : '';
}

const htmlEntries = files
  .filter((f) => basename(f) === 'index.html')
  .filter((f) => !/\/(e2e|test|tests|__tests__|fixtures|public)\//.test(f))
  .map((f) => {
    const html = read(f) ?? '';
    const og = {};
    for (const k of ['og:title', 'og:description', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt', 'og:url', 'og:type', 'og:site_name']) og[k] = metaOf(html, 'property', k);
    const twitter = {};
    for (const k of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) twitter[k] = metaOf(html, 'name', k);
    let ogImageLocal = null;
    if (og['og:image']) {
      const name = og['og:image'].split('/').pop();
      const hit = files.find((x) => basename(x) === name && x.startsWith(dirname(f)));
      ogImageLocal = hit ? rel(hit) : false;
    }
    return {
      path: rel(f),
      title: html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? null,
      description: metaOf(html, 'name', 'description'),
      favicon: /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html),
      appleTouchIcon: /apple-touch-icon/i.test(html),
      lang: html.match(/<html[^>]*lang=["']([^"']+)["']/i)?.[1] ?? null,
      og,
      twitter,
      ogImageLocal,
    };
  });

// --- CI ----------------------------------------------------------------------
const wfDir = join(gh, 'workflows');
const workflows = existsSync(wfDir)
  ? readdirSync(wfDir)
      .filter((f) => /\.ya?ml$/.test(f))
      .map((f) => {
        const y = read(join(wfDir, f)) ?? '';
        return {
          file: f,
          triggers: {
            push: /^\s*push:/m.test(y) || /on:\s*\[?[^\n]*push/.test(y),
            pullRequest: /pull_request/.test(y),
            tags: /tags:/.test(y),
            release: /^\s*release:/m.test(y),
            workflowDispatch: /workflow_dispatch/.test(y),
          },
          runsTests: /\b(test|vitest|jest|playwright|pytest|cargo test|go test)\b/.test(y),
          runsLint: /\blint\b|eslint|biome/.test(y),
          runsBuild: /\bbuild\b/.test(y),
          publishesNpm: /npm publish|pnpm publish|changesets\/action/.test(y),
          provenance: /--provenance|id-token:\s*write/.test(y),
          deploysPages: /deploy-pages|gh-pages|pages:\s*write|peaceiris|vercel|netlify/.test(y),
        };
      })
  : [];

// --- tests -------------------------------------------------------------------
const testFiles = files.filter((f) => /\.(test|spec)\.[cm]?[jt]sx?$|_test\.(go|py)$|test_.*\.py$/.test(f)).map(rel);

// --- git remote ---------------------------------------------------------------
let remote = null;
try {
  remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch {}

console.log(
  JSON.stringify(
    {
      root,
      scannedAt: new Date().toISOString().slice(0, 10),
      remote,
      knowledge,
      community,
      readme,
      package: pkg,
      site: { cname, htmlEntries },
      ci: { workflows },
      tests: { count: testFiles.length, sample: testFiles.slice(0, 10) },
    },
    null,
    2,
  ),
);
