# Using xray's data from a craft skill

xray (github.com/pearpages/xray) measures TypeScript/JavaScript repositories exactly: churn ×
cyclomatic complexity per file, the resolved import graph (tsconfig `paths`, workspaces), and
quality scores. Use it **only** when the repository is mostly `.ts`/`.tsx`/`.js`/`.jsx` and the
xray plugin's clone exists; otherwise keep the skill's own method. Never install anything to get
it. Its contract is xray's ADR-0023.

## Find it

```bash
XRAY_DATA=~/.claude/plugins/data/xray-xray
XRAY="$XRAY_DATA/xray/plugins/xray/scripts/xray.sh"
for try in 1 2; do
  test -x "$XRAY" && "$XRAY" "$XRAY_DATA" quality --help 2>/dev/null | grep -q '^Usage: xray-quality' && echo available && break
done
```

Each call first updates the clone to xray's latest release (`v0`) and rebuilds it when it moved,
so a clone older than v0.7.0 answers with the PR CLI's help once, then updates itself: hence
the second try. Missing script, no Node 22+, or both tries fail: not available. Say so in the
skill's report as an unavailable signal and fall back. Build output goes to stderr.

## Calls

All take `-C <repo root>` and print JSON on stdout. Check `version` is `1`; any other value means
the contract changed, so fall back and say why.

| Need | Command | Read |
|---|---|---|
| Hotspots | `"$XRAY" "$XRAY_DATA" quality -C <root> --only hotspots` | `metrics[0].data.rows`: `{ file, churn, complexity, hotspot }`, hottest first; `windowMonths` |
| Import graph | `"$XRAY" "$XRAY_DATA" quality -C <root> -f graph` | `modules` (repo-relative paths), `edges`: `{ from, to, typeOnly, dynamic }` |
| Feature boundaries | `"$XRAY" "$XRAY_DATA" quality -C <root> --only architecture` | `metrics[0].findings` (deep imports, cycles); `status: "unavailable"` with fewer than two features |
| Quality findings | `"$XRAY" "$XRAY_DATA" quality -C <root> -f agent --only <ids>` | `findings`: `{ analyzer, file, line?, severity, message }`; `analyzers[].status` |

`--files <paths…>` scopes hotspots and findings to a folder. Fan-in of a file = the number of
distinct `from` with that file as `to`. Ignore `typeOnly` edges when asking what depends on what
at runtime.

`dependencies` contacts the npm registry and `lint` runs the repository's own ESLint and `tsc`:
select them only when the skill needs them.
