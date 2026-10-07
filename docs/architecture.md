# Architecture

## Current system

Relay is a Next.js App Router application with a single-user Tiptap editor.
Document content stays in the editor instance. Refreshing the page clears it.
There is no document store, authentication, or dedicated backend service.

The pnpm workspace contains `apps/web` and `packages/config`. Internal packages
use `workspace:*`, dependency versions are pinned, and CI installs from the
lockfile. The config package shares TypeScript settings. ESLint and Prettier stay
at the root because one policy covers the current repository.

## Frontend boundaries

| Location              | Responsibility                                   |
| --------------------- | ------------------------------------------------ |
| `src/app`             | Routes, metadata, and root layout                |
| `features/workspaces` | Sidebar, header, status, and appearance          |
| `features/documents`  | Document canvas and title                        |
| `features/editor`     | Editor setup, formatting, and selection controls |
| `src/styles`          | Tokens and global styles                         |

The page composes `WorkspaceShell` around a server-rendered `DocumentCanvas`.
Sidebar and theme state stay local to their controls. Neither preferences nor
content are persisted. Geist fonts are self-hosted and Lucide supplies icons.
New feature directories and shared packages are added when they have code to own.

## Editor state

[ADR 0001](adr/0001-editor-engine.md) explains the choice of Tiptap and ProseMirror.
`editor.tsx` is the editor's client boundary; the document title stays outside it.
`useEditor` creates and cleans up the instance. `immediatelyRender: false` delays
initialization until after hydration. `shouldRerenderOnTransaction: false` keeps
keystrokes from rerendering the editor's React wrapper.

`editor-config.ts` defines the initial JSON document, accessible attributes, and
extensions. StarterKit provides the block types, inline marks, and undo/redo.
Headings are limited to H1–H3 and underline is disabled. Link navigation,
automatic linking, and plain-URL paste linking are disabled. Links are applied
through a URL form that accepts http, https, and mailto addresses. Placeholder
comes from the existing `@tiptap/extensions` package.

`formatting.ts` contains commands shared by both toolbars. Active and disabled
states come from the editor through `useEditorState`; they are not copied into
application state. The document row holds block and history commands. The
selection menu holds inline formatting and link editing. Commands preserve the
selection and return focus to the editor.

Tiptap's `BubbleMenu` manages the selection menu plugin. The menu excludes empty,
whitespace-only, node, read-only, and code-block selections. Focus can move into
its controls without losing the selection. Escape dismisses it until the
selection changes. Floating UI positions against the scrolling document rather
than the window, shifts or flips near edges, and hides an offscreen selection.
Opening the URL form requests a new position because the menu's size changes.

## Storage and synchronization

The editor serializes content as structured JSON. When local storage is added,
the document feature will own its storage format and schema version. Reads need
to handle malformed data, and save status needs to reflect actual write results.
Content should pass through the editor schema rather than untrusted HTML.

Local storage will not solve synchronization. Concurrent changes, reconnection,
and server acknowledgement need separate designs and tests.

A future Go service is planned for `services/realtime`, using WebSockets. Yjs is
the intended synchronization direction, but interoperability with Go needs an
explicit design and a small working test before committing to a protocol. Redis,
PostgreSQL, and object storage are candidates for later infrastructure; their
roles have not been decided.

Shared UI and protocol packages will be added when more than one consumer needs
them. Cross-language messages will need runtime validation and versioning, not
just TypeScript types.

## Validation

TypeScript enables strict checking, unchecked-index protection, and exact
optional properties. ESLint rejects explicit `any`. CI runs formatting, lint,
typecheck, Vitest tests, and the production build with a frozen install.

Tests cover editor content, formatting state, links, selection eligibility,
dismissal, undo/redo, and JSON round-tripping. Browser checks cover native
selection, keyboard focus, hydration, scrolling, themes, and layout. No
performance benchmarks have been published yet.
