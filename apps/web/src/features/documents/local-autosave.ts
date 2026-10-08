import type { Editor } from '@tiptap/core';

import {
  DOCUMENT_STORAGE_KEY,
  readLocalDocument,
  type LocalDocument,
} from './local-document';

export const AUTOSAVE_DELAY = 500;
export type SaveState =
  | { kind: 'loading' | 'idle' | 'saving' | 'saved' }
  | { kind: 'error'; reason: 'unavailable' | 'invalid' | 'write' | 'conflict' };

export type LocalAutosave = {
  flush: () => void;
  stop: () => void;
  getDraft: () => LocalDocument;
  getStoredData: () => string | null;
};

type Options = {
  editor: Editor;
  title: string;
  storage: () => Storage;
  onState: (state: SaveState) => void;
  onTitle: (title: string) => void;
};

export function startLocalAutosave({
  editor,
  title,
  storage,
  onState,
  onTitle,
}: Options): LocalAutosave {
  let local: Storage | undefined;
  let expectedRaw: string | null = null;
  let storedRaw: string | null = null;
  let dirty = false;
  let blocked = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastState = '';

  function report(state: SaveState) {
    const key = JSON.stringify(state);
    if (key === lastState) return;
    lastState = key;
    onState(state);
  }

  function getDraft(): LocalDocument {
    return {
      version: 1,
      title,
      updatedAt: new Date().toISOString(),
      content: editor.getJSON(),
    };
  }

  function conflict(raw: string | null) {
    blocked = true;
    storedRaw = raw;
    clearTimeout(timer);
    report({ kind: 'error', reason: 'conflict' });
  }

  function flush() {
    clearTimeout(timer);
    if (!dirty || blocked || !local) return;
    try {
      const current = local.getItem(DOCUMENT_STORAGE_KEY);
      // Detect a changed record before replacing the last known saved version.
      if (current !== expectedRaw) {
        conflict(current);
        return;
      }
      const raw = JSON.stringify(getDraft());
      local.setItem(DOCUMENT_STORAGE_KEY, raw);
      expectedRaw = raw;
      storedRaw = raw;
      dirty = false;
      report({ kind: 'saved' });
    } catch {
      report({ kind: 'error', reason: 'write' });
    }
  }

  try {
    local = storage();
    expectedRaw = local.getItem(DOCUMENT_STORAGE_KEY);
    storedRaw = expectedRaw;
  } catch {
    blocked = true;
    report({ kind: 'error', reason: 'unavailable' });
  }

  if (!blocked && expectedRaw !== null) {
    try {
      const saved = readLocalDocument(expectedRaw, editor.schema);
      // Use a normal transaction so formatting subscribers see restored content.
      // Restoration itself must not become an undoable editing action.
      const restored = editor
        .chain()
        .setContent(saved.content, {
          emitUpdate: false,
          errorOnInvalidContent: true,
        })
        .setMeta('addToHistory', false)
        .run();
      if (!restored) throw new Error('Document restoration failed');
      title = saved.title;
      onTitle(title);
      report({ kind: 'saved' });
    } catch {
      blocked = true;
      report({ kind: 'error', reason: 'invalid' });
    }
  } else if (!blocked) {
    report({ kind: 'idle' });
  }
  editor.setEditable(true);

  function changed() {
    dirty = true;
    if (blocked) return;
    clearTimeout(timer);
    report({ kind: 'saving' });
    timer = setTimeout(flush, AUTOSAVE_DELAY);
  }
  function hidden() {
    if (document.visibilityState === 'hidden') flush();
  }
  function storageChanged(event: StorageEvent) {
    if (
      local &&
      (event.storageArea === null || event.storageArea === local) &&
      (event.key === DOCUMENT_STORAGE_KEY || event.key === null) &&
      event.newValue !== expectedRaw
    )
      conflict(event.newValue);
  }
  editor.on('update', changed);
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', hidden);
  window.addEventListener('storage', storageChanged);

  return {
    flush,
    getDraft,
    getStoredData: () => storedRaw,
    stop() {
      flush();
      clearTimeout(timer);
      editor.off('update', changed);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('storage', storageChanged);
    },
  };
}
