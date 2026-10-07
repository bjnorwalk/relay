# Phase 3D: Keyboard behavior and shortcuts

Status: Proposed; implementation awaits approval.

## Objective

Make existing keyboard editing behavior explicit and repeatably verifiable before
introducing slash commands. Tiptap already provides standard formatting/history
shortcuts, and the document row and selection menu already support keyboard focus;
this milestone should refine that contract rather than replace native behavior.

## Scope and architecture

Branch: `feat/editor-keyboard-behavior`.

Keep shortcut presentation local to the editor feature. Add platform-appropriate
hints to existing controls without creating global document state or a new command
framework. Establish a small browser test suite for native selection, focus, and
keyboard behavior; use an established browser runner only if the existing test
stack cannot cover those interactions faithfully.

Expected UI behavior: existing controls remain quiet and keyboard reachable.
Formatting/history shortcuts preserve selection and focus. Tab and Escape work
predictably across the editor, document row, selection menu, and link form.
No new command surface or formatting nodes are planned.

## Tests and validation

Cover Cmd/Ctrl+B/I, undo/redo, text selection, toolbar activation/focus return,
Escape dismissal, link-form submission, list editing, soft breaks, and code-block
exit behavior. Preserve Tiptap defaults unless a demonstrated regression needs a
focused fix. Run `pnpm check` plus the proposed browser keyboard suite; verify
light/dark themes and a narrow viewport. Browser tests should assert behavior,
not exact pixel positions or generated class names.

## Documentation and review

Document the keyboard contract in the design system and update the roadmap.
An ADR is unnecessary unless a meaningful shortcut policy changes.

Suggested commit and PR title:
`feat(editor): refine keyboard behavior and shortcuts`.

## Deferred

Slash commands, command palette, persistence/autosave, document switching,
collaboration, backend services, authentication, comments/presence, history,
branching, and merge review remain outside this milestone.
