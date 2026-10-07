# Slate

A real-time workspace for writing, reviewing, and evolving documents together.

Slate starts with a single-user editor. The longer-term work is about what happens
when a document changes: reviewing edits, comparing versions, and bringing work
back together after people have edited separately.

## Status

Early development. The editor supports paragraphs, H1–H3, bold, italic, strike,
inline code, lists, quotes, code blocks, links, horizontal rules, and undo/redo.
Block controls sit above the document. Selecting text opens inline controls.

The workspace has light and dark themes and a collapsible sidebar. Document
switching and sharing are not available. Content is kept in memory, so refreshing
the page clears it. Real-time collaboration and storage are still planned.

[Open Slate](https://relay-hacks16.vercel.app). The production site follows `main`;
open pull requests have separate previews.

## Run locally

Use Node.js 24.x and pnpm 10.34.6. Both versions are recorded in the repository.

```sh
npm install --global pnpm@10.34.6
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). No environment variables or external
services are needed. Add configuration names to `.env.example` when they are
introduced, and keep populated `.env` files out of Git.

| Command             | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `pnpm dev`          | Start the development server                  |
| `pnpm start`        | Serve an existing production build            |
| `pnpm check`        | Run formatting, lint, types, tests, and build |
| `pnpm format`       | Format code and documentation                 |
| `pnpm format:check` | Check formatting                              |
| `pnpm lint`         | Run ESLint with no warnings allowed           |
| `pnpm typecheck`    | Generate route types and check TypeScript     |
| `pnpm test`         | Run Vitest tests                              |
| `pnpm build`        | Create a production build                     |

The Makefile provides the same checks. Tests cover editor content, formatting,
selection state, links, and undo/redo. Browser checks are also needed for native
selection, keyboard focus, and layout; jsdom cannot reproduce those fully.

## Repository

```text
apps/web/           Next.js application
  src/app/          Routes and root layout
  src/features/     Workspace, document canvas, and editor
  src/styles/       Tokens and global styles
packages/config/    Shared TypeScript settings
docs/               Architecture, design, roadmap, and decisions
.github/workflows/  Frontend CI
```

The frontend uses React, TypeScript, and Tiptap over ProseMirror. A pnpm workspace
keeps the web application separate from shared configuration. Future service
code will be added when it is needed; there are no backend services yet.

## Documentation

- [Contributing](CONTRIBUTING.md)
- [Architecture](docs/architecture.md)
- [Design system](docs/design-system.md)
- [Roadmap](docs/roadmap.md)
- [Editor engine decision](docs/adr/0001-editor-engine.md)

## License

[MIT](LICENSE).
