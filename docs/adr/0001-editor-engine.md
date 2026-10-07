# ADR 0001: Use Tiptap as the editor engine

**Status:** Accepted

## Context

Slate needs structured text, selection, undo/redo, and block commands. Building
these directly on browser editing primitives would take time away from document
review and synchronization work. The first milestone is a single-user editor.

## Decision

Use Tiptap over ProseMirror with React integration. Keep editor lifecycle,
extensions, and commands in `apps/web/src/features/editor`. Add extensions as
their behavior is needed.

Use structured editor JSON for content. Document identity and storage remain
separate from the editor instance. Define schema versions when persistence is
introduced. No hosted editor service or collaboration provider is part of this
decision.

## Rationale

Tiptap supplies commands and extensions while leaving the interface to Slate.
ProseMirror provides the document schema, transactions, selections, and history.
This lets the project start with normal editing behavior and add document-specific
controls without owning the entire editing engine.

Tiptap also has a path to Yjs integration. That will need a separate evaluation
with the planned Go service; choosing an editor does not settle synchronization.

## Alternatives considered

- **Direct ProseMirror:** more control, with more integration work at the start.
- **Lexical:** a viable editor with a different state and extension model. Tiptap
  fits the planned ProseMirror extension work.
- **Custom contenteditable:** would require owning selection, clipboard, history,
  schema, and cross-browser behavior.

## Consequences

Editor code needs a client component boundary. Package updates need extension
compatibility checks, and schema changes need serialization and migration tests.
Slate still owns accessible controls, keyboard interaction, and focus behavior.
Storage, synchronization, history, and branching remain separate decisions.

## References

- [Tiptap core concepts](https://tiptap.dev/docs/editor/core-concepts/introduction)
- [ProseMirror guide](https://prosemirror.net/docs/guide/)
