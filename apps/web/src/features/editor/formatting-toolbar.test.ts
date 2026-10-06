import { Editor } from '@tiptap/core';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { editorOptions } from './editor-config';
import { FormattingToolbar } from './formatting-toolbar';

describe('formatting controls', () => {
  let editor: Editor;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.append(container);
    editor = new Editor({ ...editorOptions, content: '<p>Some text</p>' });
    root = createRoot(container);
    await act(async () =>
      root.render(createElement(FormattingToolbar, { editor })),
    );
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    editor.destroy();
    container.remove();
    vi.unstubAllGlobals();
  });

  function button(label: string) {
    const element = container.querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    );
    if (!element) throw new Error(`Missing ${label} control`);
    return element;
  }

  it('formats the selection and updates pressed/history state', async () => {
    expect(button('Undo').disabled).toBe(true);
    await act(async () => editor.commands.setTextSelection({ from: 1, to: 5 }));
    await act(async () => button('Bold').click());
    expect(editor.getHTML()).toBe('<p><strong>Some</strong> text</p>');
    expect(button('Bold').getAttribute('aria-pressed')).toBe('true');
    expect(button('Undo').disabled).toBe(false);
    await act(async () => button('Undo').click());
    expect(editor.getHTML()).toBe('<p>Some text</p>');
    expect(button('Redo').disabled).toBe(false);
    await act(async () => button('Redo').click());
    expect(button('Bold').getAttribute('aria-pressed')).toBe('true');
  });

  it('updates the text-style control as the cursor moves between blocks', async () => {
    await act(async () =>
      editor.commands.setContent('<h2>Heading</h2><p>Body</p>'),
    );
    await act(async () => editor.commands.setTextSelection(2));
    const select = container.querySelector<HTMLSelectElement>('select');
    expect(select?.value).toBe('h2');
    await act(async () => editor.commands.setTextSelection(11));
    expect(select?.value).toBe('paragraph');
  });

  it('disables incompatible mark controls inside a code block', async () => {
    await act(async () => button('Code block').click());
    expect(button('Code block').getAttribute('aria-pressed')).toBe('true');
    expect(button('Bold').disabled).toBe(true);
    expect(button('Italic').disabled).toBe(true);
    expect(
      container.querySelector<HTMLOptionElement>('option[value="other"]')
        ?.disabled,
    ).toBe(true);
    expect(button('Undo').hasAttribute('aria-pressed')).toBe(false);
  });
});
