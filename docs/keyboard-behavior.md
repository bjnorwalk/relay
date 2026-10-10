# Keyboard editing

Tiptap supplies the editor bindings. Slate does not replace them with a workspace
key handler. Shortcuts act while the document body has focus. Commands remain
in the editor feature, and the two formatting surfaces share the same actions.

Use Command on macOS and Control on Windows or Linux. Existing button hints use
that modifier after hydration. No shortcut is shown for an action without a
binding, such as inserting a horizontal rule or opening the link form.

| Action                      | Keys                             |
| --------------------------- | -------------------------------- |
| Bold / italic / inline code | Mod+B / Mod+I / Mod+E            |
| Strike                      | Mod+Shift+S                      |
| Undo / redo                 | Mod+Z / Mod+Shift+Z (also Mod+Y) |
| Paragraph                   | Mod+Alt+0                        |
| Heading 1–3                 | Mod+Alt+1–3                      |
| Bullet / ordered list       | Mod+Shift+8 / Mod+Shift+7        |
| Blockquote / code block     | Mod+Shift+B / Mod+Alt+C          |
| Soft line break             | Shift+Enter                      |

`Mod` means the platform modifier above. Browser or OS shortcuts and keyboard
layouts can take precedence, particularly for Alt combinations.

## Selection and focus

Tab follows the native focus order. Shift+Tab moves back through enabled controls.
Buttons activate with Enter or Space; formatting restores focus to the body
without discarding the selected text. There is no focus trap or arrow-key toolbar
mode. The floating menu follows the editor in the tab order when it is visible.

Escape dismisses the selection menu without collapsing the text selection. In
the URL form, Escape cancels the pending address first and returns to the editor.
Enter submits a valid address. Invalid addresses keep the form open with an
error. Escape from the body can then dismiss the remaining selection menu.

## Block editing

StarterKit input rules convert `# `, `## `, and `### ` into headings; `- ` into a
bullet list; `1. ` into an ordered list; and `> ` into a quote. Three backticks
followed by Space begin a code block. Enter continues a list. Enter on an empty
list item returns to a paragraph. Shift+Enter keeps a soft break in the same
paragraph. In a code block, Enter twice on the empty ending line exits to a
paragraph; ArrowDown at the end can also exit.

## Checks

`pnpm test` covers command behavior, state, serialization, hints, and recovery.
`pnpm build` followed by `pnpm test:browser` checks Chromium against the production
application. Each browser test has fresh storage. Tests cover native shortcuts,
selection replacement, Tab and Escape, link submission, input rules, list exit,
soft breaks, code-block exit, refresh, and narrow light/dark layouts.

Install the browser once with
`pnpm --filter @slate/web exec playwright install chromium`.
CI installs Chromium and its Linux dependencies before running the same suite.
These checks do not establish compatibility with every browser or keyboard layout.
