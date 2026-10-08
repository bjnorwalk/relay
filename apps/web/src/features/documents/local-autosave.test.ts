import type { JSONContent } from '@tiptap/core';
import { Editor } from '@tiptap/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { editorOptions } from '../editor/editor-config';
import {
  AUTOSAVE_DELAY,
  startLocalAutosave,
  type LocalAutosave,
  type SaveState,
} from './local-autosave';
import {
  DEFAULT_DOCUMENT_TITLE,
  DOCUMENT_STORAGE_KEY,
  readLocalDocument,
} from './local-document';

function record(
  content: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] },
  title = DEFAULT_DOCUMENT_TITLE,
) {
  return JSON.stringify({
    version: 1,
    title,
    updatedAt: '2026-10-07T12:00:00.000Z',
    content,
  });
}

describe('local document autosave', () => {
  let editor: Editor;
  let autosave: LocalAutosave;
  let states: SaveState[];
  const titleRestored = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    titleRestored.mockClear();
    states = [];
    editor = new Editor({ ...editorOptions, editable: false });
  });
  afterEach(() => {
    autosave?.stop();
    editor.destroy();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  function start(storage = () => localStorage) {
    autosave = startLocalAutosave({
      editor,
      title: DEFAULT_DOCUMENT_TITLE,
      storage,
      onState: (state) => states.push(state),
      onTitle: titleRestored,
    });
  }
  function saved() {
    return localStorage.getItem(DOCUMENT_STORAGE_KEY);
  }
  function insert(text: string) {
    editor.commands.insertContent(text);
  }

  it('leaves a new empty document unsaved until it changes', () => {
    start();
    expect(editor.isEditable).toBe(true);
    expect(states.at(-1)).toEqual({ kind: 'idle' });
    vi.advanceTimersByTime(AUTOSAVE_DELAY);
    expect(saved()).toBeNull();
  });

  it('debounces edits and writes a versioned title and structured document', () => {
    start();
    insert('First');
    vi.advanceTimersByTime(AUTOSAVE_DELAY - 1);
    insert(' second');
    vi.advanceTimersByTime(AUTOSAVE_DELAY - 1);
    expect(saved()).toBeNull();
    expect(states).toEqual([{ kind: 'idle' }, { kind: 'saving' }]);
    vi.advanceTimersByTime(1);
    const restored = readLocalDocument(saved() ?? '', editor.schema);
    expect(restored.title).toBe(DEFAULT_DOCUMENT_TITLE);
    expect(restored.content).toEqual(editor.getJSON());
    expect(states.at(-1)).toEqual({ kind: 'saved' });
  });

  it('restores title and formatted content without putting restoration in undo history', () => {
    const original = new Editor({
      ...editorOptions,
      content:
        '<h2>Notes</h2><p><strong>Saved</strong> text</p><ul><li><p>Item</p></li></ul><p></p>',
    });
    localStorage.setItem(
      DOCUMENT_STORAGE_KEY,
      record(original.getJSON(), 'Research notes'),
    );
    const expected = original.getJSON();
    original.destroy();
    start();
    expect(editor.getJSON()).toEqual(expected);
    expect(titleRestored).toHaveBeenCalledWith('Research notes');
    expect(editor.can().undo()).toBe(false);
    expect(states.at(-1)).toEqual({ kind: 'saved' });
    insert('New ');
    expect(editor.commands.undo()).toBe(true);
    expect(editor.getJSON()).toEqual(expected);
  });

  it('saves the latest draft on pagehide even before the debounce expires', () => {
    start();
    insert('Before refresh');
    window.dispatchEvent(new Event('pagehide'));
    expect(readLocalDocument(saved() ?? '', editor.schema).content).toEqual(
      editor.getJSON(),
    );
  });

  it('flushes on cleanup and removes listeners and pending timers', () => {
    start();
    insert('Kept');
    autosave.stop();
    const original = saved();
    insert('Later');
    vi.runAllTimers();
    window.dispatchEvent(new Event('pagehide'));
    expect(saved()).toBe(original);
  });

  it.each([
    '{broken',
    record({ type: 'doc', content: [{ type: 'futureNode' }] }),
    record({ type: 'doc', content: [] }),
    JSON.stringify({ version: 2 }),
  ])('preserves unreadable or unsupported data: %s', (raw) => {
    localStorage.setItem(DOCUMENT_STORAGE_KEY, raw);
    start();
    insert('Recovery draft');
    vi.advanceTimersByTime(AUTOSAVE_DELAY);
    window.dispatchEvent(new Event('pagehide'));
    expect(saved()).toBe(raw);
    expect(autosave.getStoredData()).toBe(raw);
    expect(autosave.getDraft().content).toEqual(editor.getJSON());
    expect(states.at(-1)).toEqual({ kind: 'error', reason: 'invalid' });
  });

  it('keeps editing available when access to browser storage throws', () => {
    start(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    insert('Memory only');
    vi.advanceTimersByTime(AUTOSAVE_DELAY);
    expect(editor.getText()).toBe('Memory only');
    expect(states.at(-1)).toEqual({ kind: 'error', reason: 'unavailable' });
    expect(saved()).toBeNull();
  });

  it('does not write if the initial read fails', () => {
    const read = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('Read failed');
      });
    const write = vi.spyOn(Storage.prototype, 'setItem');
    start();
    insert('Memory only');
    vi.advanceTimersByTime(AUTOSAVE_DELAY);
    expect(write).not.toHaveBeenCalled();
    expect(states.at(-1)).toEqual({ kind: 'error', reason: 'unavailable' });
    read.mockRestore();
  });

  it('reports quota failure, retains the previous record, and retries the latest draft', () => {
    const original = record();
    localStorage.setItem(DOCUMENT_STORAGE_KEY, original);
    start();
    const write = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Full', 'QuotaExceededError');
      });
    insert('Not saved yet');
    vi.advanceTimersByTime(AUTOSAVE_DELAY);
    expect(saved()).toBe(original);
    expect(states.at(-1)).toEqual({ kind: 'error', reason: 'write' });
    write.mockRestore();
    autosave.flush();
    expect(readLocalDocument(saved() ?? '', editor.schema).content).toEqual(
      editor.getJSON(),
    );
    expect(states.at(-1)).toEqual({ kind: 'saved' });
  });

  it('detects a competing write before saving and preserves both versions', () => {
    start();
    insert('This tab');
    const other = record({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Other tab' }] },
      ],
    });
    localStorage.setItem(DOCUMENT_STORAGE_KEY, other);
    vi.advanceTimersByTime(AUTOSAVE_DELAY);
    expect(saved()).toBe(other);
    expect(editor.getText()).toBe('This tab');
    expect(autosave.getStoredData()).toBe(other);
    expect(states.at(-1)).toEqual({ kind: 'error', reason: 'conflict' });
  });

  it('stops a pending save when another tab emits a storage event', () => {
    start();
    insert('This tab');
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: DOCUMENT_STORAGE_KEY,
        newValue: 'Other saved data',
      }),
    );
    vi.advanceTimersByTime(AUTOSAVE_DELAY);
    expect(saved()).toBeNull();
    expect(states.at(-1)).toEqual({ kind: 'error', reason: 'conflict' });
  });

  it('flushes when the document becomes hidden', () => {
    start();
    insert('Hidden draft');
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(readLocalDocument(saved() ?? '', editor.schema).content).toEqual(
      editor.getJSON(),
    );
  });

  it('restores a flushed draft into a new editor instance', () => {
    start();
    insert('Written before closing');
    autosave.stop();
    const expected = editor.getJSON();
    editor.destroy();
    editor = new Editor({ ...editorOptions, editable: false });
    start();
    expect(editor.getJSON()).toEqual(expected);
    expect(editor.can().undo()).toBe(false);
  });

  it('rejects unknown attributes rather than saving a stripped document', () => {
    start();
    const raw = record({
      type: 'doc',
      content: [{ type: 'paragraph', attrs: { futureData: 'Keep me' } }],
    });
    expect(() => readLocalDocument(raw, editor.schema)).toThrow();
  });

  it('ignores selection-only transactions', () => {
    start();
    editor.commands.setTextSelection(1);
    vi.advanceTimersByTime(AUTOSAVE_DELAY);
    expect(saved()).toBeNull();
    expect(states).toEqual([{ kind: 'idle' }]);
  });

  it('rejects unsupported heading and unsafe link content before restoring', () => {
    start();
    const badHeading = record({
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 6 } }],
    });
    const badLink = record({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Link',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
      ],
    });
    expect(() => readLocalDocument(badHeading, editor.schema)).toThrow();
    expect(() => readLocalDocument(badLink, editor.schema)).toThrow();
  });
});
