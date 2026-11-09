# Security

The security surface of {{NAME}} and the rules that protect it. General rules are in
[principles.md](principles.md); how the pieces fit in [architecture.md](architecture.md).
Update this file whenever the surface changes (new input, endpoint, secret, dependency,
permission).

## Reporting a vulnerability

{{How to report privately: email, GitHub private advisory, or "open a confidential issue".
Never a public issue for an unfixed vulnerability.}}

## Surface

{{What an attacker can reach: inputs, endpoints, file/URL handling, auth boundaries,
third-party services, what runs with elevated permissions. "None — pure library with no I/O"
is a valid answer; say so.}}

## Secrets

- Never committed. {{Where they live: env vars, secret manager, CI secrets.}}
- `.env*` files are gitignored; an example file lists names only.
- {{Rotation / who has access.}}

## Dependencies

{{Policy: minimal runtime deps, lockfile committed, pinned CI actions. How updates arrive: when
they aren't automated yet, write "TODO: run `/craft:deps setup`".}}

## Known risks

{{Accepted risks with why they are accepted, or "None known".}}
