import { Editor } from '@tiptap/core';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { editorOptions } from './editor-config';
import { SelectionToolbar } from './selection-toolbar';

describe('contextual formatting controls', () => {
  let editor: Editor;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    // jsdom has no text geometry; real positioning is verified in browser checks.
    const createRange = document.createRange.bind(document);
    vi.spyOn(document, 'createRange').mockImplementation(() => {
      const range = createRange();
      range.getBoundingClientRect = () => new DOMRect(20, 100, 120, 20);
      range.getClientRects = () =>
        Object.assign([new DOMRect(20, 100, 120, 20)], {
          item: (index: number) =>
            index === 0 ? new DOMRect(20, 100, 120, 20) : null,
        });
      return range;
    });
    container = document.createElement('div');
    document.body.append(container);
    const content = document.createElement('div');
    container.append(content);
    editor = new Editor({
      ...editorOptions,
      element: content,
      content: '<p>Some text</p>',
    });
    const mount = document.createElement('div');
    container.append(mount);
    root = createRoot(mount);
    await act(async () =>
      root.render(createElement(SelectionToolbar, { editor })),
    );
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    editor.destroy();
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function menu() {
    return document.querySelector<HTMLDivElement>(
      '[aria-label="Text formatting"]',
    );
  }
  async function select() {
    await act(async () => {
      editor.view.dom.focus();
      editor.commands.setTextSelection({ from: 1, to: 5 });
      await new Promise((resolve) => setTimeout(resolve, 120));
    });
  }

  it('appears for a selection, uses the shared command, and hides when collapsed', async () => {
    expect(menu()).toBeNull();
    await select();
    const bold = menu()?.querySelector<HTMLButtonElement>(
      'button[aria-label="Bold"]',
    );
    expect(bold).not.toBeUndefined();
    await act(async () => bold?.click());
    expect(editor.getHTML()).toBe('<p><strong>Some</strong> text</p>');
    expect(bold?.getAttribute('aria-pressed')).toBe('true');
    expect(editor.state.selection.from).toBe(1);
    expect(editor.state.selection.to).toBe(5);
    await act(async () => editor.commands.setTextSelection(7));
    expect(menu()).toBeNull();
  });

  it('reflects combined marks and clears when focus leaves the editor', async () => {
    await select();
    await act(async () => editor.chain().toggleBold().toggleItalic().run());
    expect(
      menu()
        ?.querySelector('[aria-label="Bold"]')
        ?.getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      menu()
        ?.querySelector('[aria-label="Italic"]')
        ?.getAttribute('aria-pressed'),
    ).toBe('true');
    await act(async () => editor.view.dom.blur());
    expect(menu()).toBeNull();
  });

  it('dismisses with Escape and allows the same text to be selected again', async () => {
    await select();
    await act(async () => {
      menu()?.querySelector<HTMLButtonElement>('button')?.focus();
      menu()?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(editor.view.dom);
    await act(async () => {
      editor.commands.setTextSelection(5);
      editor.commands.setTextSelection({ from: 1, to: 5 });
      await new Promise((resolve) => setTimeout(resolve, 120));
    });
    expect(menu()).not.toBeNull();
  });

  it('dismisses from the editor without collapsing the selection', async () => {
    await select();
    await act(async () =>
      editor.view.dom.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      ),
    );
    expect(menu()).toBeNull();
    expect(editor.state.selection.from).toBe(1);
    expect(editor.state.selection.to).toBe(5);
    expect(document.activeElement).toBe(editor.view.dom);
  });
});
