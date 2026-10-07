import type { ChainedCommands, Editor } from '@tiptap/core';

const headingLevels = { h1: 1, h2: 2, h3: 3 } as const;
export type TextStyle = 'paragraph' | keyof typeof headingLevels;

const commands = {
  bold: (chain: ChainedCommands) => chain.toggleBold(),
  italic: (chain: ChainedCommands) => chain.toggleItalic(),
  strike: (chain: ChainedCommands) => chain.toggleStrike(),
  code: (chain: ChainedCommands) => chain.toggleCode(),
  bulletList: (chain: ChainedCommands) => chain.toggleBulletList(),
  orderedList: (chain: ChainedCommands) => chain.toggleOrderedList(),
  blockquote: (chain: ChainedCommands) => chain.toggleBlockquote(),
  codeBlock: (chain: ChainedCommands) => chain.toggleCodeBlock(),
  horizontalRule: (chain: ChainedCommands) => chain.setHorizontalRule(),
  undo: (chain: ChainedCommands) => chain.undo(),
  redo: (chain: ChainedCommands) => chain.redo(),
  unlink: (chain: ChainedCommands) => chain.extendMarkRange('link').unsetLink(),
};

export type FormattingAction = keyof typeof commands;

export function runFormatting(editor: Editor, action: FormattingAction) {
  return commands[action](editor.chain().focus()).run();
}

export function setTextStyle(editor: Editor, style: TextStyle) {
  const chain = editor.chain().focus();
  return style === 'paragraph'
    ? chain.setParagraph().run()
    : chain.setHeading({ level: headingLevels[style] }).run();
}

export function setDocumentLink(editor: Editor, address: string) {
  const href = address.trim();
  try {
    const url = new URL(href);
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return false;
  } catch {
    return false;
  }
  if (!editor.isEditable) return false;
  return editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
}

export function getFormattingState(editor: Editor) {
  const actionState = (action: FormattingAction) => ({
    active: editor.isActive(action),
    enabled: editor.isEditable && commands[action](editor.can().chain()).run(),
  });
  const heading = ([1, 2, 3] as const).find((level) =>
    editor.isActive('heading', { level }),
  );

  return {
    textStyle: heading
      ? (`h${heading}` as TextStyle)
      : editor.isActive('paragraph')
        ? 'paragraph'
        : 'other',
    styles: {
      paragraph:
        editor.isEditable &&
        (editor.isActive('paragraph') || editor.can().setParagraph()),
      h1:
        editor.isEditable &&
        (editor.isActive('heading', { level: 1 }) ||
          editor.can().setHeading({ level: 1 })),
      h2:
        editor.isEditable &&
        (editor.isActive('heading', { level: 2 }) ||
          editor.can().setHeading({ level: 2 })),
      h3:
        editor.isEditable &&
        (editor.isActive('heading', { level: 3 }) ||
          editor.can().setHeading({ level: 3 })),
    },
    link: {
      active: editor.isActive('link'),
      enabled: editor.isEditable && editor.can().setMark('link'),
    },
    bold: actionState('bold'),
    italic: actionState('italic'),
    strike: actionState('strike'),
    code: actionState('code'),
    bulletList: actionState('bulletList'),
    orderedList: actionState('orderedList'),
    blockquote: actionState('blockquote'),
    codeBlock: actionState('codeBlock'),
    horizontalRule: actionState('horizontalRule'),
    undo: actionState('undo'),
    redo: actionState('redo'),
  };
}
