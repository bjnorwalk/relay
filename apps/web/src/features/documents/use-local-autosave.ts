'use client';

import type { Editor } from '@tiptap/core';
import { useEffect } from 'react';
import { startLocalAutosave } from './local-autosave';
import { DEFAULT_DOCUMENT_TITLE } from './local-document';
import { useDocumentActions } from './document-provider';

export function useLocalAutosave(editor: Editor | null) {
  const actions = useDocumentActions();
  useEffect(() => {
    if (!editor) return;
    const autosave = startLocalAutosave({
      editor,
      title: DEFAULT_DOCUMENT_TITLE,
      storage: () => window.localStorage,
      onState: actions.setSave,
      onTitle: actions.setTitle,
    });
    actions.register(autosave);
    return () => {
      autosave.stop();
      actions.register(null);
    };
  }, [editor, actions]);
}
