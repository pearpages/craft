#!/usr/bin/env bash
set -euo pipefail
cat > AGENTS.md <<'MD'
# confload
Loads a project's config file. Work is tracked in GitHub Issues.
MD
mkdir -p src
cat > src/load.js <<'JS'
import { existsSync, readFileSync } from 'node:fs';

export function loadConfig(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8'));
}
JS
cat > GIT-STATE.md <<'MD'
## git status
On branch fix/12-missing-config
Changes to be committed:
	modified:   src/load.js
	modified:   src/load.test.js
Changes not staged for commit:
	modified:   src/cli.js

## git diff --cached
```diff
--- a/src/load.js
+++ b/src/load.js
@@ -1,5 +1,6 @@
-import { readFileSync } from 'node:fs';
+import { existsSync, readFileSync } from 'node:fs';

 export function loadConfig(path) {
+  if (!existsSync(path)) return {};
   return JSON.parse(readFileSync(path, 'utf8'));
 }
--- a/src/load.test.js
+++ b/src/load.test.js
@@ -8,3 +8,7 @@ test('reads a config file', () => {
   assert.deepEqual(loadConfig(fixture), { name: 'demo' });
 });
+
+test('a missing config file gives the defaults instead of throwing', () => {
+  assert.deepEqual(loadConfig('/nope/config.json'), {});
+});
```

## git diff (unstaged, not part of this commit)
```diff
--- a/src/cli.js
+++ b/src/cli.js
@@ -3 +3 @@
-const VERBOSE = false;
+const VERBOSE = true; // temporary, for debugging
```

## git log --oneline -12
```
a1f3c9e loader: Read the config path from CONFLOAD_PATH
7b2d410 cli: Print the resolved path with --verbose
3e9c8a1 loader: Merge defaults before the file's values
c54e2f7 docs: Explain the lookup order
91ab3d0 cli: Exit 2 on an unknown flag
5f0e6b2 loader: Accept a .jsonc extension
d2c7a18 tests: Cover the merge order
0e4b9f3 cli: Add --version
8a6d1c5 loader: Fail with the file name on bad JSON (#9)
4c3e2b7 docs: Add the install section
f9a0d16 build: Ship the CLI as an ES module
2b81e04 Initial commit
```
MD
