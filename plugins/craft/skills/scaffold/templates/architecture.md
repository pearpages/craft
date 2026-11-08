# Architecture

How {{NAME}} is built. It explains *how* things work. The rules that follow from it are in
[principles.md](principles.md), the reasons for each choice in
[decisions.md](decisions.md), the security surface in [security.md](security.md), and open
work in [GitHub Issues]({{ISSUES_URL}}). When code and this file disagree, the code is right and this
file is a bug.

## Shape

{{Kind of project (library, app, service, CLI…), language/runtime, entry points, what it
ships or deploys as.}}

## Modules

{{Top-level directories and what each owns. A tree or a table; a Mermaid diagram (diagram
skill) when there are more than a handful of moving parts.}}

## Data flow

{{How a request / input moves through the system; where state lives; external services.}}

## Build, test, deploy

{{Toolchain, test layers, CI, where it deploys and how a release happens.}}
