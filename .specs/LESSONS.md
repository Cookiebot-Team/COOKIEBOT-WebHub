# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - When the test harness is static render only, expose state-dependent UI (errors, toasts) through an initial-state prop so its markup can be asserted, or assign it explicitly to the browser layer in the coverage matrix
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `webhub/v2 tests` · harmful: 0
- features: savebar-wrap-and-testids
- evidence: validation.md M16/M17 (ui.tsx:197, audit/AuditFilters.tsx:96) (webhub/v2 tests)
- last seen: 2026-10-12T01:29:32Z

### L-002 - When an AC defines an ID or key pattern with a placeholder, enumerate the allowed placeholder values in the spec so tests can pin the full set
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `testids` · harmful: 0
- features: savebar-wrap-and-testids
- evidence: validation.md G2/G3 (spec AC T9, T10) (testids)
- last seen: 2026-10-12T01:29:32Z

### L-003 - When a React context has a no-op default, test that the required provider is mounted, since removing it fails silently
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `layouts` · harmful: 0
- features: remove-v1-design
- evidence: AC6 / validation.md M5 (layouts)
- last seen: 2026-10-12T01:41:20Z

### L-004 - Prove a must-not-render UI requirement with a render-level absence assertion, not only a file-deleted check
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `routes` · harmful: 0
- features: remove-v1-design
- evidence: AC2 / validation.md M6 (routes)
- last seen: 2026-10-12T01:41:20Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
