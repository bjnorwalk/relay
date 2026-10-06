# Design system direction

## Status

This document records the direction for Phase 2. Phase 1 includes only a minimal
CSS baseline; no application shell, token palette, themes, or shared component
library has been implemented.

## Principles

Relay should feel quiet, precise, editorial, and fast. The document is the visual
focus. Use clear hierarchy, readable typography, generous document whitespace,
and subtle separators. Controls should appear where they help the current task.

Linear informs hierarchy and density, Craft informs document presentation,
Raycast informs keyboard interaction, Figma informs subtle presence, GitHub
informs history/review concepts, and Notion informs structured editing. These
are product references, not component templates to reproduce.

Avoid large gradients, glowing effects, excessive glass, rounded card grids,
decorative widgets, arbitrary colors, and hero layouts within the editor. Every
visible control should have real behavior. Do not present a save state unless
there is a persistence operation behind it.

## Color and themes

Light mode should use warm off-white application chrome, a white or subtly
differentiated document surface, near-black primary text, and neutral secondary
text. Dark mode should use near-black chrome, slightly raised document surfaces,
and warm light text. Both should share one restrained accent system.

Introduce CSS custom properties in `apps/web/src/styles` during Phase 2. Prefer
semantic tokens such as `--surface-app`, `--surface-document`, `--text-primary`,
`--text-secondary`, `--border-subtle`, `--accent`, and `--focus-ring`. Add spacing,
type, width, and radius tokens only when needed. Components should consume
semantic tokens instead of repeating raw palette values.

Define both themes through the same token names. Respect the system preference
initially and specify explicit theme selection when implementing the shell.
Verify text, focus indicators, and essential control boundaries in both themes.

## Typography and layout

Use Geist or a comparably clean sans-serif for interface text. Choose document
typography for sustained reading: a comfortable line height, controlled line
length, and a distinct heading hierarchy. Font loading should not make production
builds depend on fetching fonts from an external service.

The shell will contain restrained navigation, a document header, the document
canvas, and a subtle status area. On small screens, prioritize reading/editing
space and make navigation accessible without obscuring document content. Avoid
horizontal overflow and keep toolbar targets usable with touch and keyboard.

## Interaction and accessibility

Use semantic HTML, labeled controls, visible focus, and logical tab order.
Support reduced motion and avoid animation without a clear interaction purpose.
Do not communicate state using color alone.

Selection tools should preserve editor selection and return focus predictably.
Slash commands must support filtering, arrow-key navigation, Enter, Escape, and
clear active-item feedback. Document these keyboard behaviors when the features
are introduced and verify them in browser tests.

## Component ownership

Keep feature-specific components with their feature. A first-use component may
stay local. Extract to `packages/ui` when there is demonstrated reuse or a clear
primitive, such as a button or accessible popover, with an agreed contract.
Do not install a large UI framework or build a generic component factory.
