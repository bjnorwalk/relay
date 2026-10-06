# Architecture

## Current boundary

Milestone 1, Phase 2 contains a Next.js App Router application, a mostly static
workspace shell, and repository tooling. It has no document editor, data storage,
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
future editor. Global baseline styles live in `src/styles`.

The route composes `features/workspaces/WorkspaceShell` around a server-rendered
`features/documents/DocumentCanvas`. Shell components and their CSS module stay
in the workspace feature. Only sidebar visibility and appearance require local
client state. Neither preference nor document content is persisted. Geist is
self-hosted through its font package; Lucide supplies the outline icons.

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

[ADR 0001](adr/0001-editor-engine.md) selects Tiptap over ProseMirror. The editor
will be a client-side feature with a deliberately small extension set. Keep
editor instance state inside the editor boundary and avoid broadcasting every
keystroke through application-wide React state.

Document content will use the editor's structured JSON representation. When
persistence arrives, define and validate the storage envelope, including its
schema version, before accepting saved content. The exact persistence types are
deferred until implementation. Render content through the editor/schema rather
than inserting untrusted HTML.

Initial support will include paragraphs, headings, emphasis, code, quotes, lists,
tasks, links, and undo/redo. Selection tools follow stable command behavior;
slash commands follow a stable base editor. Tiptap is not installed in Phase 1.

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
build. There are no behavior suites yet. Add tests with editor serialization and
commands, then browser selection/keyboard behavior and local persistence.

Future performance work will measure editor responsiveness, initial load,
propagation latency, concurrent connections, reconstruction time, offline
recovery, snapshot size, and memory per connection. No benchmarks or performance
claims exist yet.
