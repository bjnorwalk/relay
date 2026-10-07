# Roadmap

Slate is in early development. This sequence keeps changes small enough to
review and test separately. It may change as the implementation reveals new
constraints; it is not a release schedule.

## Editor foundation

| Phase                  | Status      | Result                                                                   |
| ---------------------- | ----------- | ------------------------------------------------------------------------ |
| 1 — Repository         | Implemented | pnpm workspace, strict TypeScript, checks, docs, and CI                  |
| 2 — Workspace shell    | Implemented | Document canvas, navigation, themes, and responsive layout               |
| 3A — Editor            | Implemented | Tiptap schema, placeholder, document typography, and tests               |
| 3B — Formatting        | Implemented | Shared commands, block controls, active state, and undo/redo             |
| 3C — Selection toolbar | Implemented | Inline controls, link editing, selection/focus behavior, and positioning |

The editor is single-user and session-only. Refresh clears its content. Sharing,
document switching, and command controls are not available.

## Next: keyboard behavior and shortcuts

Standard shortcuts already come from Tiptap. The next small change is to document
that behavior and add repeatable browser tests for formatting/history shortcuts,
selection, Tab and Escape, link submission, lists, soft breaks, and code-block
exit. Existing controls should show platform-appropriate shortcut hints.

This work stays in the editor feature. It does not add another command surface,
new document nodes, or storage. Native behavior should be changed only when a
reproducible problem calls for it.

## Following work

1. **Slash commands:** block insertion and conversion, with filtering, keyboard
   navigation, selection preservation, and focus return.
2. **Local documents and persistence:** document identity, switching, storage,
   and save status. Test reloads, malformed data, unavailable storage, and failed
   writes. A command palette can follow once document actions exist.

## Later work

- A Go real-time service and an evaluated synchronization protocol.
- Offline editing and reconnection, including concurrent changes and recovery.
- Comments, presence, permissions, and sharing.
- Visual document history, diffs, and restoration.
- Document branching, comparison, and merge review.
- Load testing, synchronization metrics, and measured performance work.

Authentication, Yjs, WebSockets, Redis, PostgreSQL, and object storage belong to
later work. Their contracts and failure behavior need decisions before they
become dependencies. Performance claims will need benchmarks.
