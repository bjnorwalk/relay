# Contributing

Check the [roadmap](docs/roadmap.md) before starting a change. Discuss changes to
editor state, document storage, or service boundaries before implementing them.

## Setup and checks

Use Node.js 24.x and the pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
```

`pnpm check` runs formatting, lint, TypeScript, tests, and a production build.
Fix failures rather than loosening the checks. For interface changes, also check
keyboard navigation, focus, light/dark themes, and narrow layouts in a browser.
Editor tests live beside the feature and use real Tiptap instances. Add tests for
behavior that could break, rather than tests that repeat the implementation.

## Code and review

Keep product code in `apps/web/src/features/<feature>/`. Routes compose features;
they should not contain editor logic. Keep state with the component or editor
that owns it. Extract shared components when there is a second use or a clear
need for a common primitive.

Use strict types, descriptive names, and the existing design tokens. Explain
unusual constraints in comments. Add a dependency only when the platform or an
existing package does not cover the need.

Keep a pull request focused on one change. Use subjects such as
`feat(editor): add heading commands` or `fix(web): restore focus after navigation`.
Describe what changed, why, and how it was checked. Record decisions that affect
future architecture in `docs/adr/`; routine implementation choices do not need
an ADR.

Before committing, review `git status`, `git diff`, and `git diff --cached`.
Do not include credentials, populated `.env` files, private document content,
local configuration, or build output.

## Reporting a problem

Include reproduction steps, expected and actual behavior, browser, operating
system, and the commit or version tested. Remove private content from examples.
For a feature request, explain the problem it would solve and its scope.

## Browser checks

After `pnpm build`, run `pnpm test:browser`. Install Chromium first with
`pnpm --filter @slate/web exec playwright install chromium`. The suite starts a
production server on port 3101 and uses isolated browser storage. Keep that port
free. See [Keyboard editing](docs/keyboard-behavior.md) for the current contract.
