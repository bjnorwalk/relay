# Roadmap

Slate is in early development. This sequence keeps changes small enough to
review and test separately. It may change as the implementation reveals new
constraints; it is not a release schedule.

## Editor foundation

| Phase                       | Status      | Result                                                                   |
| --------------------------- | ----------- | ------------------------------------------------------------------------ |
| 1 — Repository              | Implemented | pnpm workspace, strict TypeScript, checks, docs, and CI                  |
| 2 — Workspace shell         | Implemented | Document canvas, navigation, themes, and responsive layout               |
| 3A — Editor                 | Implemented | Tiptap schema, placeholder, document typography, and tests               |
| 3B — Formatting             | Implemented | Shared commands, block controls, active state, and undo/redo             |
| 3C — Selection toolbar      | Implemented | Inline controls, link editing, selection/focus behavior, and positioning |
| Local autosave and recovery | Implemented | One browser-local document, accurate save status, and recovery actions   |

Local autosave was moved ahead of keyboard refinement because refresh recovery
is needed for ordinary writing. The editor now restores one browser-local
document. Sharing, document switching, and command controls are not available.

## Keyboard behavior and shortcuts

Phase 3D adds platform-aware shortcut hints and Chromium tests for the existing
editor bindings, selection, focus, links, and block editing. See
[Keyboard editing](keyboard-behavior.md). It introduces no additional document
nodes or storage behavior.

## Next: slash commands

Block insertion and conversion need a focused menu with filtering, keyboard
navigation, selection preservation, and focus return. This remains separate from
the workspace command palette and document switching.

## Following work

1. **Slash commands:** block insertion and conversion, with filtering, keyboard
   navigation, selection preservation, and focus return.
2. **Multiple local documents:** add document identity, creation, and switching
   on top of the current storage boundary. Preserve recovery and failed-write
   handling. A command palette can follow once document actions exist.

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
