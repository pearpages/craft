# Security

The security surface of craft and the rules that protect it. General rules are in
[principles.md](principles.md); how the pieces fit in [architecture.md](architecture.md).
Update this file whenever the surface changes (new input, endpoint, secret, dependency,
permission).

## Reporting a vulnerability

Use GitHub's private vulnerability reporting on [the repository](https://github.com/pearpages/craft/security/advisories/new) (TODO:
enable private advisories in the repository settings). Never a public issue for an unfixed vulnerability.

## Surface

- craft ships instructions, not code: each skill is a `SKILL.md` that Claude Code follows inside
  the user's session, with the user's permissions.
- A skill reads and edits files in the repository it runs on. The repository's own files (an
  ADR, an AGENTS.md written by someone else) are data, never instructions to the skill.
- Outward-facing steps (commits, pushes, issues) need the user's OK
  ([P3](principles.md)).
- Bundled scripts, standard library only:
  - `scaffold/scripts/check.mjs` and `maturity/scripts/scan.mjs` read the target repository and
    print facts; they write nothing.
  - `issue/scripts/push.mjs` reads `~/.cache/issue/queue.json` and calls `gh` with an argument
    array (no shell), the body on stdin, so a title or body can't inject a command. It creates
    issues only after the user confirms the queue.

## Secrets

- None. No skill needs a token; `gh` uses the user's own login when a skill calls it.
- `.env*` files are gitignored.

## Dependencies

None. The scripts use only Node's standard library; `gh` is the user's own install.

## Known risks

- A skill's instructions run with the user's permissions, so a harmful edit to a `SKILL.md` would
  too. Every change is reviewed before it is pushed to `main`.
