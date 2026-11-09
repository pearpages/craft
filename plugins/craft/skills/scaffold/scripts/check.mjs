#!/usr/bin/env node
// Compliance facts about a repo for the /scaffold skill. Facts only — no judgment.
// Usage: node check.mjs [repoPath]   → JSON on stdout. Zero dependencies.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(process.argv[2] ?? '.');
const read = (p) => {
  try {
    return readFileSync(join(root, p), 'utf8');
  } catch {
    return null;
  }
};
const lines = (s) => (s == null ? 0 : s.split('\n').length);

// Markdown link targets: [text](target) → target without #anchor, leading ./
const linkTargets = (md) =>
  [...(md ?? '').matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) =>
    m[1].split('#')[0].replace(/^\.\//, ''),
  );
// Claude Code imports: @path at line start or after whitespace, outside links
const imports = (md) =>
  [...(md ?? '').matchAll(/(?:^|\s)@([\w./-]+\.md)\b/gm)].map((m) => m[1].replace(/^\.\//, ''));

const KNOWLEDGE = ['README.md', 'AGENTS.md', 'CLAUDE.md', 'principles.md', 'architecture.md', 'decisions.md', 'security.md'];
const LINKED_FROM_AGENTS = ['principles.md', 'architecture.md', 'decisions.md', 'security.md'];

const files = {};
for (const f of KNOWLEDGE) {
  const c = read(f);
  files[f] = { exists: c != null, lines: lines(c) };
}

// Entry files
const claude = read('CLAUDE.md');
const agents = read('AGENTS.md');
const claudeImports = imports(claude);
const claudeNonImportLines = (claude ?? '')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !/^@[\w./-]+$/.test(l) && !l.startsWith('<!--'));
const agentsLinks = new Set(linkTargets(agents));

const entry = {
  claudeImportsAgents: claudeImports.includes('AGENTS.md'),
  claudeImportsPrinciples: claudeImports.includes('principles.md'),
  claudeIsShim: claude != null && claudeNonImportLines.length === 0,
  claudeExtraLines: claudeNonImportLines.length,
  claudeDatedHeadings: (claude?.match(/^#+ .*\d{4}-\d{2}-\d{2}/gm) ?? []).length, // session-log smell
  agentsLinks: Object.fromEntries(LINKED_FROM_AGENTS.map((f) => [f, agentsLinks.has(f)])),
  agentsLinksLicense: agentsLinks.has('LICENSE'),
  agentsLinksIssues: [...agentsLinks].some((l) => /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/?$/.test(l)),
};

// Knowledge standard version: the repo's line in AGENTS.md vs the newest in standard-changes.md
const changes = (() => {
  try {
    return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../references/standard-changes.md'), 'utf8');
  } catch {
    return '';
  }
})();
const versions = [...changes.matchAll(/^## v(\d+)\b/gm)].map((m) => Number(m[1]));
const standard = {
  repo: Number(agents?.match(/Knowledge standard: craft v(\d+)/)?.[1] ?? 0),
  current: versions.length ? Math.max(...versions) : null,
};
standard.behind = standard.current != null && standard.repo < standard.current;

// ADRs
const adrDir = join(root, 'docs/adr');
const adrFiles = existsSync(adrDir)
  ? readdirSync(adrDir).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort()
  : [];
const decisions = read('decisions.md');
const decisionLinks = new Set(linkTargets(decisions));
const adrs = {
  dir: existsSync(adrDir),
  count: adrFiles.length,
  unindexed: adrFiles.filter((f) => !decisionLinks.has(`docs/adr/${f}`)),
  dangling: [...decisionLinks].filter((l) => l.startsWith('docs/adr/') && !existsSync(join(root, l))),
  missingStatus: adrFiles.filter((f) => !/\*\*Status:\*\*/i.test(read(`docs/adr/${f}`) ?? '')),
};

// Work is tracked in GitHub Issues. A tasks.md is legacy: its open work has to move to issues.
const tasks = read('tasks.md');
const legacyTasks = tasks == null ? null : {
  lines: lines(tasks),
  openCheckboxes: (tasks.match(/^\s*- \[ \]/gm) ?? []).length,
};

// GitHub remote, read from .git/config (no git or network calls)
const gitConfig = read('.git/config') ?? '';
const remote = gitConfig.match(/\[remote "origin"\][^[]*?url\s*=\s*(\S+)/)?.[1] ?? null;
const github = remote?.match(/github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?$/);
const issues = {
  remote,
  repo: github ? `${github[1]}/${github[2]}` : null,
  url: github ? `https://github.com/${github[1]}/${github[2]}/issues` : null,
};

// Cross-links between the knowledge files
const crossLinks = {};
for (const f of ['principles.md', 'architecture.md', 'decisions.md', 'security.md']) {
  const c = read(f);
  if (c != null) crossLinks[f] = linkTargets(c).filter((t) => KNOWLEDGE.includes(t));
}

// README
const readme = read('README.md');
const readmeFacts = {
  title: readme?.match(/^# (.+)$/m)?.[1] ?? null,
  headings: readme?.match(/^## .+$/gm)?.map((h) => h.slice(3)) ?? [],
  mentionsLicense: /licen[cs]e/i.test(readme ?? ''),
  todos: (readme?.match(/\bTODO\b/g) ?? []).length,
};

// License
const licenseFile = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING'].find((f) => existsSync(join(root, f))) ?? null;
const licenseText = licenseFile ? read(licenseFile) : null;
let pkg = null;
try {
  pkg = JSON.parse(read('package.json'));
} catch {}
const license = {
  file: licenseFile,
  firstLine: licenseText?.split('\n').find((l) => l.trim())?.trim() ?? null,
  packageLicense: pkg?.license ?? null,
  packagePrivate: pkg?.private ?? null,
};

// TODOs left in knowledge files
const todos = {};
for (const f of KNOWLEDGE) {
  const n = (read(f)?.match(/\bTODO\b/g) ?? []).length;
  if (n) todos[f] = n;
}

// Unfilled template placeholders — must be zero after /scaffold
const placeholders = {};
for (const f of [...KNOWLEDGE, ...adrFiles.map((a) => `docs/adr/${a}`), 'LICENSE']) {
  const n = (read(f)?.match(/\{\{[^}]+\}\}/g) ?? []).length;
  if (n) placeholders[f] = n;
}

// Repo basics + stack hints
const MANIFESTS = ['package.json', 'pyproject.toml', 'requirements.txt', 'Cargo.toml', 'go.mod', 'Gemfile', 'composer.json', 'pom.xml', 'build.gradle', 'build.gradle.kts', 'mix.exs', 'Package.swift', 'deno.json', 'pubspec.yaml', '*.csproj'];
const top = existsSync(root) ? readdirSync(root) : [];
const basics = {
  git: existsSync(join(root, '.git')),
  gitignore: existsSync(join(root, '.gitignore')),
  editorconfig: existsSync(join(root, '.editorconfig')),
  manifests: MANIFESTS.filter((m) => (m.startsWith('*') ? top.some((f) => f.endsWith(m.slice(1))) : top.includes(m))),
  topLevel: top.filter((f) => !['.git', 'node_modules', '.DS_Store'].includes(f)),
};
basics.isNew = basics.topLevel.filter((f) => !f.startsWith('.')).length === 0;

console.log(JSON.stringify({ root, files, standard, entry, adrs, issues, legacyTasks, crossLinks, readme: readmeFacts, license, todos, placeholders, basics }, null, 2));
