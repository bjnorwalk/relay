# ADR 0001: Use Tiptap as the editor engine

**Status:** Accepted

## Context

Relay needs structured rich-text editing, reliable selection and undo behavior,
custom block commands, and full control over presentation. Later work will
explore real-time coauthoring and document evolution. Implementing an editing
engine from browser primitives would divert effort from those product and
systems concerns.

The first milestone is single-user editing. Selecting an engine now clarifies
the feature boundary without introducing synchronization infrastructure.

## Decision

Use the open-source Tiptap editor, built on ProseMirror, with React integration.
Install it in Milestone 1, Phase 3. Keep editor lifecycle, extensions, and commands
inside `apps/web/src/features/editor` and add only extensions required by the
initial editing scope.

Use structured editor JSON for document content. Define schema/version handling
when persistence is implemented. Keep document identity and storage separate
from editor instance state. The decision does not include hosted editor services,
paid extensions, or a collaboration provider.

## Rationale

Tiptap provides a headless extension and command API over ProseMirror while
allowing Relay to own the entire interface. ProseMirror's document schema,
transactions, and selections provide a foundation for structured editing.
Tiptap also offers a path to later Yjs integration, which must be evaluated
separately with the planned service architecture.

## Alternatives considered

- **Direct ProseMirror:** Maximum control, but more integration and extension
  plumbing for the initial editor. Revisit only if Tiptap becomes a constraint.
- **Lexical:** A viable structured editor with a different state/extension model.
  Tiptap better fits the selected ProseMirror direction and anticipated extension
  work; this is not a claim that Lexical cannot support collaboration.
- **Custom contenteditable:** Too much selection, schema, history, clipboard,
  and cross-browser behavior to own for this project's scope.

## Consequences

- Relay depends on Tiptap/ProseMirror APIs and must review extension compatibility
  when updating packages.
- Schema changes will need migration and serialization tests.
- Interactive editor code requires an explicit client component boundary.
- Relay owns accessible toolbars, keyboard commands, and selection/focus behavior.
- Synchronization, offline recovery, history, branching, and merges remain
  separate designs. Engine selection does not solve their semantics.

## References

- [Tiptap core concepts](https://tiptap.dev/docs/editor/core-concepts/introduction)
- [ProseMirror guide](https://prosemirror.net/docs/guide/)
