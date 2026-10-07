# Design system

The document should be the first thing a reader notices. Navigation and controls
provide context, but they should leave room for writing. The current interface
uses neutral surfaces, small controls, and limited color.

## Tokens and appearance

Tokens live in `apps/web/src/styles/tokens.css`. Surface, text, border, accent,
and focus colors have semantic names. Spacing, typography, control size, radius,
and transition timing are also defined there.

Light mode uses warm off-white chrome and a slightly lighter document surface.
Dark mode uses near-black chrome with a separate document surface and warm light
text. The selection menu has a raised surface and a small shadow so it remains
readable over the document. The rest of the workspace has no decorative elevation.

Both themes use CSS `light-dark()` and `color-scheme`. System appearance is the
default before hydration. The Appearance select sets `data-theme` to choose
light or dark. The choice is not stored, so refresh returns to system appearance.
Browsers need support for `light-dark()`.

## Typography and layout

Geist Variable is self-hosted for the interface and document body. The document
title uses Georgia at regular weight. Body text has a generous line height and
a 40rem maximum writing width. Headings in the body are smaller than the title.

Quotes use a thin left rule. Inline code uses a neutral background; code blocks
scroll inside the writing column. Lists keep normal indentation. The empty
editor shows **Start writing…** and has no input border or surrounding card.

The header and status bar stay outside the scrolling document. Below 48rem, the
sidebar becomes a compact navigation and appearance row. Sample documents are
hidden at that width. Collapsing the sidebar does not open an overlay or trap
focus. Controls wrap within the document width to prevent page overflow.

## Formatting controls

The document row sits below the title. It contains a native text-style select,
block commands, and undo/redo. Selecting editable text opens the inline menu for
bold, italic, strike, code, and links. The menu is hidden for collapsed cursors,
whitespace-only or node selections, code blocks, read-only content, and focus
outside the editor or menu.

Buttons have accessible names, visible focus, and pressed or disabled states.
Lucide icons and native title hints are used throughout. Tab reaches the enabled
controls without a focus trap. Enter or Space activates a button. Formatting
returns focus to the editor and preserves the selected text.

Escape closes the URL form first, then dismisses the selection menu. The link
form has a labeled field, Apply and Remove controls, and an inline error for
unsupported addresses. Links use the accent color and an underline. Standard
editor shortcuts remain supplied by Tiptap.

## Focus and motion

The editor uses a short accent rule in the left gutter for keyboard focus;
other controls use the global focus outline. Sidebar collapse keeps focus on
its toggle. The skip link focuses the document landmark. Reduced-motion
preference removes the short color transitions. Color alone does not communicate
active state.

## Unavailable controls

Home, sample documents, Share, and Commands are disabled with explanatory labels
or titles. The avatar is a placeholder, not a presence indicator. The footer says
**Session only · Not saved** because there is no persistence yet. The document
title is a static H1 above the editable body.

## Component ownership

Editor and workspace components stay in their features. A shared UI package
will be added when a component is used in more than one place and needs a common
contract. There is no separate UI framework or component library today.
