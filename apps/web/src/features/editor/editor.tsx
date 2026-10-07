'use client';

import { EditorContent, useEditor } from '@tiptap/react';

import { FormattingToolbar } from './formatting-toolbar';
import { SelectionToolbar } from './selection-toolbar';
import { editorOptions } from './editor-config';
import styles from './editor.module.css';

export function DocumentEditor() {
  const editor = useEditor({
    ...editorOptions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <>
      {editor && <FormattingToolbar editor={editor} />}
      <EditorContent editor={editor} className={styles.editor} />
      {editor && <SelectionToolbar editor={editor} />}
    </>
  );
}
