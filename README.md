# Relay

A real-time workspace for writing, reviewing, and evolving documents together.

Relay explores collaborative documents where version history, review, and
branching are first-class concepts rather than secondary tools.

## Status

Early development. Current milestone: **Editor Foundation**.

Phase 3C adds contextual inline formatting and link editing to the Tiptap
editor. A separate document row provides paragraph/heading styles, lists,
quotes, code, and undo/redo. Document storage and real-time collaboration are
not implemented yet. Refreshing the page clears the document.

## Project overview

Relay is an engineering project exploring document editing, synchronization, and
review workflows. Its long-term differentiators are visual document history,
document branching and merge review, dependable offline/reconnection behavior,
and a carefully designed interface.

## Product principles

- Keep the document at the center of a quiet, precise interface.
- Make everyday writing and review accessible through keyboard interaction.
- Make synchronization state understandable and recovery dependable.
- Keep history and review legible as documents evolve.
- Prefer explicit boundaries, observable behavior, and measurable performance.

## Current capabilities

- Next.js App Router application with React and strict TypeScript.
- Responsive workspace shell with sidebar collapse and system/light/dark themes.
- Tiptap document body with paragraphs, H1–H3, emphasis, code, quotes, lists,
  horizontal rules, and undo/redo; accessible controls reflect selection state.
- Selection controls for emphasis and safe link editing; sharing and commands
  remain deferred.
- pnpm workspace and a shared TypeScript configuration package.
- ESLint, Prettier, and frontend CI checks.
- Architecture, design direction, roadmap, and an editor engine decision record.

## Architecture direction

The web application owns presentation and feature-level interaction. Tiptap,
built on ProseMirror, owns editor state within `features/editor`. The document
title remains separate from the editor body.

Later milestones may introduce a Go real-time service, WebSocket transport, Yjs,
Redis, PostgreSQL, and object storage. These are planned boundaries, not current
dependencies or implemented services. See [architecture](docs/architecture.md)
and [ADR 0001](docs/adr/0001-editor-engine.md).

## Repository structure

```text
relay/
├── apps/web/                  # Next.js application
│   └── src/
│       ├── app/               # Routes and root layout
│       ├── features/          # Workspace shell, document canvas, and editor
│       └── styles/            # Semantic tokens and global styles
├── packages/config/           # Shared TypeScript settings
├── docs/
│   ├── architecture.md
│   ├── design-system.md
│   ├── roadmap.md
│   └── adr/                   # Meaningful architecture decisions
├── .github/                   # Frontend CI and contribution templates
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── Makefile
```

`packages/ui`, `packages/types`, and `services/realtime` will be added when there
is meaningful shared code or service code to place in them. Empty scaffolding
is intentionally omitted.

## Development

Requirements: **Node.js 24.x** and **pnpm 10.34.6**. The package manager is pinned
in `package.json`; `.node-version` records the Node.js major used in CI.

If pnpm is not installed, install the pinned version:

```sh
npm install --global pnpm@10.34.6
```

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). No environment variables or external
services are required. `.env.example` is the inventory for future configuration;
do not commit populated `.env` files.

| Command             | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| `pnpm dev`          | Start the web development server                            |
| `pnpm build`        | Build workspace applications for production                 |
| `pnpm start`        | Serve the previously built web application                  |
| `pnpm lint`         | Lint source and configuration with zero warnings allowed    |
| `pnpm typecheck`    | Generate Next.js route types and check TypeScript           |
| `pnpm test`         | Run test scripts in workspaces that define them             |
| `pnpm format`       | Format source, configuration, and documentation             |
| `pnpm format:check` | Check formatting without modifying files                    |
| `pnpm check`        | Run formatting, lint, typecheck, available tests, and build |

The Makefile provides equivalent convenience targets, including `make check`.
The pnpm scripts are the source of truth.

**Tests:** `pnpm test` runs the web application's Vitest/jsdom tests for initial
editor state, formatting commands and controls, history availability, safe link
handling, selection eligibility/dismissal, and structured JSON round-tripping.
Verify browser typing, selection, focus, themes, and responsive layout
separately; jsdom does not model browser selection/layout faithfully.

## Project documentation

- [Contributing](CONTRIBUTING.md)
- [Architecture](docs/architecture.md)
- [Design system direction](docs/design-system.md)
- [Roadmap and next issue](docs/roadmap.md)
- [Architecture decisions](docs/adr/0001-editor-engine.md)

## License

[MIT](LICENSE).
