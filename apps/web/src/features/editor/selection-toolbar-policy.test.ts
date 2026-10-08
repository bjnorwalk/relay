import { Editor } from '@tiptap/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { editorOptions } from './editor-config';
import {
  hasInlineSelection,
  shouldShowSelectionToolbar,
} from './selection-toolbar-policy';

describe('contextual selection policy', () => {
  let editor: Editor;
  let menu: HTMLDivElement;
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.append(element);
    editor = new Editor({
      ...editorOptions,
      element,
      content: '<p>Some text</p>',
    });
    menu = document.createElement('div');
    menu.tabIndex = 0;
    document.body.append(menu);
  });

  afterEach(() => {
    element.remove();
    editor.destroy();
    menu.remove();
  });

  it('shows only a meaningful editable text range during an editing interaction', () => {
    editor.view.dom.focus();
    expect(shouldShowSelectionToolbar({ editor, element: menu })).toBe(false);
    editor.commands.setTextSelection({ from: 1, to: 5 });
    expect(shouldShowSelectionToolbar({ editor, element: menu })).toBe(true);
    editor.view.dom.blur();
    expect(shouldShowSelectionToolbar({ editor, element: menu })).toBe(false);
    menu.focus();
    expect(shouldShowSelectionToolbar({ editor, element: menu })).toBe(true);
    editor.setEditable(false);
    expect(shouldShowSelectionToolbar({ editor, element: menu })).toBe(false);
  });

  it.each([
    '<h2>Some text</h2>',
    '<ul><li><p>Some text</p></li></ul>',
    '<blockquote><p>Some text</p></blockquote>',
  ])('allows inline formatting within %s', (html) => {
    editor.commands.setContent(html);
    editor.commands.selectAll();
    expect(hasInlineSelection(editor)).toBe(true);
  });

  it('excludes whitespace, node selections, code blocks, and ranges crossing code blocks', () => {
    editor.commands.setContent('<p>   </p>');
    editor.commands.selectAll();
    expect(hasInlineSelection(editor)).toBe(false);
    editor.commands.setContent('<hr><p>Some text</p>');
    editor.commands.setNodeSelection(0);
    expect(hasInlineSelection(editor)).toBe(false);
    editor.commands.setContent(
      '<pre><code>Some code</code></pre><p>Some text</p>',
    );
    editor.commands.setTextSelection({ from: 1, to: 5 });
    expect(hasInlineSelection(editor)).toBe(false);
    editor.commands.selectAll();
    expect(hasInlineSelection(editor)).toBe(false);
  });
});
