'use client';

import { EditorContent, useEditor } from '@tiptap/react';

import { editorOptions } from './editor-config';
import styles from './editor.module.css';

export function DocumentEditor() {
  const editor = useEditor({
    ...editorOptions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return <EditorContent editor={editor} className={styles.editor} />;
}
