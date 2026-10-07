# Architecture

## Current boundary

Milestone 1, Phase 3C contains a Next.js App Router application, workspace
shell, and single-user Tiptap editor foundation. It has no document storage,
authentication, or dedicated backend service.

The pnpm workspace includes `apps/*` and `packages/*`. Packages are private and
internal references use `workspace:*` so local dependencies cannot accidentally
resolve from the registry. Direct dependency versions and the package manager
are pinned; `pnpm-lock.yaml` records the resolved graph. CI uses a frozen install.

`packages/config` exposes shared TypeScript compiler settings. ESLint and
Prettier live at the root because they currently serve one repository-wide
policy; no custom configuration framework or task orchestrator is needed.

ESLint 9.39.5 is pinned because the React, accessibility, and import plugins in
the current Next.js configuration declare support through ESLint 9. ESLint 9 is
upstream end-of-support; move to ESLint 10 when that plugin chain declares
compatibility. Keep strict peer dependency checking enabled rather than
overriding the incompatibility. TypeScript 5.9.3 stays within the lint parser's
supported range.

## Web application

`apps/web/src/app` owns routing, metadata, and the root layout. Routes should
compose feature code rather than own editor logic. Use Server Components by
default and introduce client boundaries for interactive behavior, including the
editor. Global baseline styles live in `src/styles`.

The route composes `features/workspaces/WorkspaceShell` around a server-rendered
`features/documents/DocumentCanvas`. Shell components and their CSS module stay
in the workspace feature. Sidebar visibility and appearance use local client
state; the editor owns its own state. Neither preferences nor content are
persisted. Geist is self-hosted through its font package; Lucide supplies the
outline icons.

Create feature directories only as their behavior arrives:

| Boundary              | Intended responsibility                                 |
| --------------------- | ------------------------------------------------------- |
| `features/editor`     | Editor lifecycle, extensions, commands, selection tools |
| `features/documents`  | Document identity, metadata, and local persistence      |
| `features/workspaces` | Workspace navigation and document organization          |
| `features/history`    | History presentation, comparison, and restoration       |
| `features/comments`   | Review threads and comment interaction                  |
| `features/presence`   | Collaborator presence and remote selection rendering    |

History, comments, and presence are outside Milestone 1. Generic components,
hooks, and libraries should be extracted only when their responsibility is
actually shared. Do not create empty feature modules or generic service layers.

## Editor direction

[ADR 0001](adr/0001-editor-engine.md) selects Tiptap, built on ProseMirror.
`features/editor/editor.tsx` is the editor's client boundary, mounted inside the
server-rendered document canvas. `useEditor` manages instance creation/cleanup;
`immediatelyRender: false` defers initialization until after hydration, and
`shouldRerenderOnTransaction: false` avoids React rerenders for each keystroke.
There is no application-wide document state or custom editor lifecycle wrapper.

`editor-config.ts` centralizes the initial JSON document, extensions, and
accessible editor attributes. StarterKit supplies paragraphs, H1–H3, bold,
italic, strike, inline code, code blocks, blockquotes, bullet/ordered lists,
hard breaks, horizontal rules, and undo/redo. The document title stays separate
from body headings. Underline remains disabled. Link support uses StarterKit's
safe URI validation, with navigation, automatic linking, and plain-URL paste
linking disabled. A selection URL form applies, updates, and removes links
through the shared commands; it accepts explicit http, https, and mailto
addresses. Placeholder comes from `@tiptap/extensions`, which StarterKit already
uses. There are no custom nodes, extension registries, or collaboration
extensions.

Document content uses the editor's structured JSON representation. When
persistence arrives, define and validate the storage envelope, including its
schema version, before accepting saved content. The exact persistence types are
deferred until implementation. Render content through the editor/schema rather
than inserting untrusted HTML.

`formatting.ts` owns reusable actions and text-style changes. Its state selector
reads active marks/blocks and command availability directly from the editor;
capability checks do not dispatch document changes. Both formatting surfaces
subscribe through `useEditorState`, so cursor movement does not rerender the
workspace or editor content. Pointer controls preserve selection and commands
restore editor focus. The native text-style select keeps platform keyboard
behavior. `FormattingToolbar` retains block/history controls. `SelectionToolbar`
reuses the same commands and state for inline controls and link editing.

The selection toolbar uses Tiptap React's supported `BubbleMenu` integration,
already included in the dependency graph. Its eligibility policy excludes
collapsed, whitespace-only, node, read-only, and code-block selections. Focus
may move into the menu without losing the document selection. Escape dismisses
the current selection until it changes; leaving the editor/menu hides the tools.
Floating UI positions against the document landmark, which scrolls independently
of the window, with offset, flip, shift, and offscreen-reference hiding. The URL
form requests a position update when its size changes. Tiptap owns plugin
registration/cleanup; local UI state only tracks form visibility and dismissal.

Task lists and slash commands remain deferred.

## Persistence direction

Phase 5 will add simple browser-local document persistence. Keep it at the
document feature boundary, handle unavailable storage and malformed saved
content explicitly, and make save status reflect actual persistence results.
Choose the storage mechanism with the initial document model; a full repository
abstraction is unnecessary now.

Local persistence does not imply offline synchronization. Reconnection,
concurrent changes, durable server acknowledgement, and conflict handling need
separate designs and tests in later milestones.

## Future service boundaries

The planned real-time service will live in `services/realtime` and use Go with
WebSocket transport. Yjs is the intended synchronization direction, but its
protocol, interoperability with Go, ownership of document state, and recovery
semantics require a later ADR and an interoperability spike before implementation.
Do not assume that a Go service directly implements Yjs document semantics.

PostgreSQL, Redis, and object storage are future candidates for durable data,
ephemeral coordination, and document artifacts. Their roles, deployment topology,
and failure behavior remain open decisions. No dependencies, clients, schemas,
or Go CI are present for them.

Add `packages/ui` for genuine shared UI primitives and `packages/types` for
shared domain/protocol contracts when multiple consumers need them. TypeScript
types alone cannot validate a WebSocket payload or establish a cross-language
contract; runtime validation and protocol versioning will need explicit design.

## Quality and measurement

TypeScript uses strict checking, unchecked-index protection, and exact optional
properties. ESLint enforces the Next.js recommendations and rejects explicit
`any`; Prettier owns formatting. Third-party declaration checks are skipped as
in the standard Next.js setup, while application code remains strictly checked.

CI checks formatting, lint, types, available workspace tests, and production
build. Vitest/jsdom tests exercise initial editor state, content updates,
undo/redo, formatting commands/control state, structured JSON round-tripping,
safe link handling, selection eligibility/dismissal, and exclusion of
unsupported content. Browser checks verify rendering, hydration,
selection/keyboard behavior, themes, and layout; jsdom is not a substitute for
browser selection/layout testing.

Future performance work will measure editor responsiveness, initial load,
propagation latency, concurrent connections, reconstruction time, offline
recovery, snapshot size, and memory per connection. No benchmarks or performance
claims exist yet.
