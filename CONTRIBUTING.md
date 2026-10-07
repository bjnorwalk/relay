# Contributing to Relay

Relay is in early development. Keep contributions focused on the current
milestone and discuss changes to major boundaries before implementing them.
See the [roadmap](docs/roadmap.md) for scope and sequencing.

## Milestone planning

Use the current implementation, roadmap, architecture, design system, ADRs, and
testing conventions together when planning work. After a phase, compare the
roadmap with what shipped and propose the next smallest reviewable milestone.
Minor sequencing adjustments should explain the implementation need.

A proposal should state its objective, feature branch, architecture changes, UI
behavior, tests, validation, documentation implications, suggested commit/PR
title, and explicitly deferred functionality. Keep major phases separate and
obtain approval before starting the next milestone.

## Local setup

Use Node.js 24.x and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

No backend or environment configuration is required at this stage.

## Implementation conventions

- Organize product code under `apps/web/src/features/<feature>/`.
- Keep routes thin and state ownership local and explicit.
- Keep first-use components local; extract shared primitives when reuse warrants it.
- Use strict types and descriptive names. Avoid `any`, hidden side effects, and
  unnecessary abstractions.
- Explain non-obvious constraints in comments; let readable code explain mechanics.
- Use semantic design tokens when the application shell introduces them.
- Add dependencies only when the platform or existing packages cannot reasonably
  solve the problem. Explain significant additions in the pull request.

## Validation

Run `pnpm check` before requesting review. Fix failures instead of weakening
rules or bypassing checks. For UI changes, also verify responsive layouts,
keyboard navigation, visible focus, and both themes.

The root `test` command dispatches to the web application's Vitest/jsdom suite.
Editor tests live alongside the feature and exercise real editor instances,
content changes, history, and serialization. Add focused tests with each feature;
priorities include formatting commands, keyboard interaction, slash command
filtering/navigation, and persistence failure/recovery. Use browser checks where
DOM selection and real keyboard/layout behavior matter.

## Changes and review

Use focused branches and small, reviewable commits. Conventional-style subjects
include `feat(editor): add heading commands`, `fix(web): restore focus after
navigation`, and `docs: clarify persistence boundaries`.

Pull requests should explain the problem, resulting behavior, validation, and
material tradeoffs. Record meaningful architecture decisions in `docs/adr/`
using the structure of ADR 0001. Do not create ADRs for routine implementation
details.

Before committing, inspect `git status`, `git diff`, and `git diff --cached`.
Include only files relevant to the change. Keep credentials, populated `.env`
files, private document content, local development configuration, and build
artifacts out of commits. Record required configuration names in `.env.example`
with empty values.

## Reporting issues

For bugs, provide reproduction steps, expected and actual behavior, browser,
operating system, and commit/version. Remove private content from examples.
For proposals, describe the problem and acceptance criteria, then explain how
the work fits the milestone.
