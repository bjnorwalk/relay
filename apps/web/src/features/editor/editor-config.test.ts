import { Editor } from '@tiptap/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { editorOptions } from './editor-config';

describe('document editor', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      ...editorOptions,
      element: document.createElement('div'),
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('starts with an editable, labelled empty paragraph and a visual hint', () => {
    expect(editor.isEmpty).toBe(true);
    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    });
    expect(editor.view.dom.getAttribute('contenteditable')).toBe('true');
    expect(editor.view.dom.getAttribute('aria-label')).toBe('Document content');
    expect(editor.view.dom.getAttribute('aria-multiline')).toBe('true');
    expect(editor.view.dom.querySelector('p')?.dataset.placeholder).toBe(
      'Start writing…',
    );
  });

  it('accepts paragraph edits, removes the hint, and supports undo/redo', () => {
    editor.commands.insertContent(
      '<p>First paragraph.</p><p>Second paragraph.</p>',
    );
    const editedDocument = editor.getJSON();

    expect(editor.getText()).toBe('First paragraph.\n\nSecond paragraph.');
    expect(editor.view.dom.querySelector('.is-editor-empty')).toBeNull();
    expect(editor.commands.undo()).toBe(true);
    expect(editor.isEmpty).toBe(true);
    expect(editor.commands.redo()).toBe(true);
    expect(editor.getJSON()).toEqual(editedDocument);
  });

  it('round-trips structured blocks and inline marks without losing content', () => {
    editor.commands.setContent(`
      <h2>Outline</h2>
      <p><strong>Bold</strong> <em>italic</em> <s>strike</s> <code>inline</code><br>New line</p>
      <blockquote><p>A quotation.</p></blockquote>
      <ul><li><p>Bullet</p></li></ul>
      <ol><li><p>Numbered</p></li></ol>
      <pre><code>const ready = true;</code></pre>
      <hr>
      <p>End.</p>
    `);
    const serialized = editor.getJSON();
    expect(serialized.content?.map((node) => node.type)).toEqual([
      'heading',
      'paragraph',
      'blockquote',
      'bulletList',
      'orderedList',
      'codeBlock',
      'horizontalRule',
      'paragraph',
    ]);
    expect(
      serialized.content?.[1]?.content?.flatMap(
        (node) => node.marks?.map((mark) => mark.type) ?? [],
      ),
    ).toEqual(['bold', 'italic', 'strike', 'code']);

    editor.commands.clearContent();
    editor.commands.setContent(JSON.parse(JSON.stringify(serialized)));
    expect(editor.getJSON()).toEqual(serialized);
  });

  it('preserves safe links while excluding underline and unsupported media', () => {
    editor.commands.setContent(
      '<p><a href="https://example.com">Reference</a> <u>plain</u><img src="example.png"></p>',
    );
    expect(editor.getHTML()).toContain('href="https://example.com"');
    expect(editor.getHTML()).not.toMatch(/<u>|<img/);
    expect(editor.getText()).toBe('Reference plain');
  });

  it('rejects unsafe links in imported content and commands', () => {
    editor.commands.setContent(
      '<p><a href="javascript:alert(1)">Reference</a></p>',
    );
    expect(editor.getHTML()).toBe('<p>Reference</p>');
    editor.commands.selectAll();
    expect(editor.commands.setLink({ href: 'javascript:alert(1)' })).toBe(
      false,
    );
    expect(editor.isActive('link')).toBe(false);
  });
});
