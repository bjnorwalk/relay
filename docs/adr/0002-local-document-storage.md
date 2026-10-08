# ADR 0002: Save the current document in browser storage

**Status:** Accepted

## Context

The editor currently loses work on refresh. Server storage and synchronization
are later milestones, but a single-user document needs basic recovery now.

## Decision

Store one versioned JSON record in localStorage. The documents feature owns the
record and save lifecycle; Tiptap owns live content. Save after a short idle
period, and attempt to flush pending changes when leaving or hiding the page.

Validate records against the current editor schema before restoration. Leave
unreadable or unsupported data untouched. Report write failures and offer a draft
download. Stop autosave when a changed stored record is detected in another tab.

## Rationale

localStorage fits one small local document without adding a dependency or backend.
Its synchronous writes allow a final best-effort save during page lifecycle
events. A versioned record leaves room for explicit migrations later.

## Alternatives considered

- **IndexedDB:** better for many documents and larger data, with more asynchronous
  storage and lifecycle work than this phase needs.
- **Server storage:** requires document identity, access control, and service work
  that has not been designed yet.
- **Session-only content:** cannot recover ordinary work after a refresh.

## Consequences

Data belongs to one browser and origin. Clearing site data removes it. Quota or
privacy settings can prevent saving. Debouncing leaves a short unsaved interval,
and lifecycle callbacks do not guarantee recovery after a crash.

The tab-conflict check is a guard, not a concurrency protocol. Cross-tab and
cross-device editing, backups, schema migrations, and document switching need
separate designs. localStorage may be replaced when those requirements grow.
