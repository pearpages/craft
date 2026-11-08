# Principles

Every change to this repository, whether code, docs, tests or process, complies with these
rules. When a change would break one, stop and ask the user instead of working around it.
Changing a principle is itself a decision: it needs the user's agreement and an ADR
([decisions.md](decisions.md)). How things are built is in
[architecture.md](architecture.md); security rules in [security.md](security.md).

Each rule has a **Why**, and a **Check** where something enforces it (a test, lint rule,
CI step, hook).

## {{AREA}}

**P1. {{Rule stated as a testable sentence.}}**
*Why:* {{the incident or trade-off behind it.}} *Check:* {{what enforces it, or "review".}}

## Process

**P{{N}}. Knowledge lives in its file.** How to work → `AGENTS.md`; rules → here; how it is
built → `architecture.md`; why → an ADR; work → GitHub Issues; risk → `security.md`.
*Why:* a session log in the agent file hides decisions from the next person.
[ADR-0001](docs/adr/0001-project-knowledge-files.md)
