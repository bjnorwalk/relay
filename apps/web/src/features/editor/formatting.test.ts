import { Editor } from '@tiptap/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { editorOptions } from './editor-config';
import {
  getFormattingState,
  runFormatting,
  setTextStyle,
  setDocumentLink,
} from './formatting';

describe('formatting commands', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      ...editorOptions,
      element: document.createElement('div'),
      content: '<p>Selected words</p>',
    });
    editor.commands.setTextSelection({ from: 1, to: 9 });
  });

  afterEach(() => editor.destroy());

  it.each(['bold', 'italic', 'strike', 'code'] as const)(
    'toggles %s on the selected text and reports cursor state',
    (action) => {
      expect(runFormatting(editor, action)).toBe(true);
      expect(getFormattingState(editor)[action].active).toBe(true);
      expect(editor.getJSON().content?.[0]?.content?.[0]?.marks).toEqual([
        { type: action },
      ]);
      editor.commands.setTextSelection(3);
      expect(getFormattingState(editor)[action].active).toBe(true);
      editor.commands.setTextSelection(12);
      expect(getFormattingState(editor)[action].active).toBe(false);
      editor.commands.setTextSelection({ from: 1, to: 9 });
      runFormatting(editor, action);
      expect(editor.getHTML()).toBe('<p>Selected words</p>');
    },
  );

  it.each(['h1', 'h2', 'h3'] as const)(
    'sets %s and returns to a paragraph without losing text',
    (style) => {
      expect(setTextStyle(editor, style)).toBe(true);
      expect(getFormattingState(editor).textStyle).toBe(style);
      expect(getFormattingState(editor).styles[style]).toBe(true);
      expect(editor.getHTML()).toBe(
        `<${style}>Selected words</${style}><p></p>`,
      );
      setTextStyle(editor, 'paragraph');
      expect(getFormattingState(editor).textStyle).toBe('paragraph');
      expect(getFormattingState(editor).styles.paragraph).toBe(true);
      expect(editor.getHTML()).toBe('<p>Selected words</p><p></p>');
    },
  );

  it.each([
    ['bulletList', '<ul><li><p>Selected words</p></li></ul>'],
    ['orderedList', '<ol><li><p>Selected words</p></li></ol>'],
    ['blockquote', '<blockquote><p>Selected words</p></blockquote>'],
    ['codeBlock', '<pre><code>Selected words</code></pre>'],
  ] as const)('toggles %s with predictable serialization', (action, html) => {
    expect(runFormatting(editor, action)).toBe(true);
    expect(editor.getHTML()).toBe(`${html}<p></p>`);
    expect(getFormattingState(editor)[action].active).toBe(true);
    runFormatting(editor, action);
    expect(editor.getHTML()).toBe('<p>Selected words</p><p></p>');
  });

  it('inserts a horizontal rule and keeps a writable paragraph', () => {
    editor.commands.setTextSelection(15);
    expect(runFormatting(editor, 'horizontalRule')).toBe(true);
    expect(editor.getHTML()).toBe('<p>Selected words</p><hr><p></p>');
  });

  it('derives history availability and restores the formatted document', () => {
    expect(getFormattingState(editor).undo.enabled).toBe(false);
    expect(getFormattingState(editor).redo.enabled).toBe(false);
    runFormatting(editor, 'bold');
    const formatted = editor.getJSON();
    expect(getFormattingState(editor).undo.enabled).toBe(true);
    runFormatting(editor, 'undo');
    expect(editor.getHTML()).toBe('<p>Selected words</p>');
    expect(getFormattingState(editor).redo.enabled).toBe(true);
    runFormatting(editor, 'redo');
    expect(editor.getJSON()).toEqual(formatted);
    expect(getFormattingState(editor).redo.enabled).toBe(false);
  });

  it('disables incompatible marks in code blocks without mutating content', () => {
    runFormatting(editor, 'codeBlock');
    const before = editor.getJSON();
    expect(getFormattingState(editor).bold.enabled).toBe(false);
    expect(getFormattingState(editor).italic.enabled).toBe(false);
    expect(getFormattingState(editor).textStyle).toBe('other');
    expect(editor.getJSON()).toEqual(before);
  });

  it('applies, updates, and removes a link while preserving selected text', () => {
    expect(setDocumentLink(editor, ' https://example.com/notes ')).toBe(true);
    expect(getFormattingState(editor).link.active).toBe(true);
    expect(editor.getText()).toBe('Selected words');
    expect(editor.getAttributes('link').href).toBe('https://example.com/notes');
    expect(setDocumentLink(editor, 'mailto:writer@example.com')).toBe(true);
    expect(editor.getAttributes('link').href).toBe('mailto:writer@example.com');
    expect(runFormatting(editor, 'unlink')).toBe(true);
    expect(editor.getHTML()).toBe('<p>Selected words</p>');
  });

  it.each(['javascript:alert(1)', 'data:text/html,test', 'not a URL', ''])(
    'rejects %s without changing the document',
    (address) => {
      const before = editor.getJSON();
      expect(setDocumentLink(editor, address)).toBe(false);
      expect(editor.getJSON()).toEqual(before);
    },
  );

  it('disables commands for a read-only document', () => {
    editor.setEditable(false);
    const state = getFormattingState(editor);
    expect(state.bold.enabled).toBe(false);
    expect(state.bulletList.enabled).toBe(false);
    expect(state.styles.h1).toBe(false);
  });
});
