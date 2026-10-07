# Design system direction

## Status

Phase 3B adds a compact formatting row and editable document typography to the
Phase 2 workspace shell, semantic tokens, responsive layout, and system/light/dark
appearance. Shared
primitives remain local to the application; there is no shared component library
yet.

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

CSS custom properties live in `apps/web/src/styles/tokens.css`. The shell uses
`--surface-app`, `--surface-sidebar`, `--surface-document`, `--surface-hover`,
`--surface-selected`, `--text-primary`, `--text-secondary`, `--text-disabled`,
`--border-subtle`, `--accent`, and `--focus-ring`. Spacing, typography, control
radius, layout dimensions, and transition timing also use tokens. A raised
surface and subtle popover shadow distinguish contextual tools; application
chrome has no decorative elevation.

Both palettes use the same token names through CSS `light-dark()` and
`color-scheme`. System appearance is the default, including before hydration;
the native Appearance select can explicitly choose light or dark. Selection
updates `data-theme` on the root element without storage or an initialization
script. Refresh returns to system appearance. This requires a modern browser
with `light-dark()` support. Verify text and focus in both palettes.

## Typography and layout

Interface text uses self-hosted Geist Variable from the font package, with a
system sans-serif fallback. The document title uses Georgia at regular weight;
body text uses Geist with a generous line height. The writing column has a 40rem
maximum width. Font loading and production builds need no external font service.

The shell will contain restrained navigation, a document header, the document
canvas, and a subtle status area. On small screens, prioritize reading/editing
space and make navigation accessible without obscuring document content. Avoid
horizontal overflow and keep toolbar targets usable with touch and keyboard.
Below 48rem, the sidebar becomes a compact navigation/appearance row; sample
documents are omitted. Sidebar collapse works at all sizes without an overlay
or focus trap. Header and status remain separate from the scrolling document.

## Current shell behavior

Home, sample document rows, Share, and Commands are native disabled buttons with
explanatory labels or titles. Documents links to the current document landmark.
The avatar is explicitly a user placeholder, without a presence indicator. The
footer says **Session only · Not saved**; it does not claim persistence. The
document title remains a static H1 above the editable body.

The editor inherits the document body typography and readable column. H1–H3
use restrained sans-serif headings; quotes use a subtle left rule; code uses a
neutral surface and monospace type. Lists retain normal indentation and code
blocks scroll within the column. An empty paragraph shows **Start writing…**.
The writing surface has no input border or surrounding card. Keyboard focus
uses a short accent rule in the left gutter rather than an outline around the
whole editor; other controls retain the global focus outline. Text selection
uses the existing palette. Body H1 is intentionally smaller than the separate
serif document title.

The block/history formatting row sits below the title and above the body, with a
single subtle separator and no enclosing card. A native text-style select and
grouped Lucide buttons wrap within the document width on narrow screens. Buttons
expose their names, pressed state, and actual command availability. Native title
hints label icon controls without a separate tooltip dependency. Tab traverses
enabled controls normally; Enter/Space activates buttons and returns focus to
the editor. The row displays no platform-specific shortcut labels. Standard
editor shortcuts remain supplied by Tiptap. Links use the accent and an
underline.

Inline controls appear in a compact selection menu above meaningful editable
text selections. They are hidden for collapsed cursors, whitespace-only or node
selections, code blocks, read-only content, and focus outside the editor/menu.
Bold, italic, strike, code, and link buttons expose pressed state. Tiptap
positions the menu within the scrolling document and flips/shifts it near edges.
The raised surface uses a restrained border, small radius, and subtle shadow.

Tab reaches the selection menu and its buttons without a focus trap; activating
formatting returns focus to the editor while preserving selection. Escape closes
the link form first, then dismisses the menu for the current selection. A
labeled URL field supports applying, editing, and removing a link, with an
inline validation error for unsupported addresses. No browser prompt is used.

Sidebar collapse preserves the toggle's focus and removes hidden navigation from
keyboard traversal. The skip link focuses the document landmark. The native
Appearance select preserves platform keyboard behavior. Focus rings are visible,
hover/active states apply only to enabled controls, and reduced-motion preference
removes the short color transitions.

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
