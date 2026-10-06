import type { EditorOptions } from '@tiptap/core';
import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';

export const editorOptions: Partial<EditorOptions> = {
  extensions: [
    StarterKit.configure({
      // The document title owns H1; links and underline belong to later phases.
      heading: { levels: [2, 3, 4] },
      link: false,
      underline: false,
      dropcursor: { color: 'var(--accent)' },
    }),
    Placeholder.configure({ placeholder: 'Start writing…' }),
  ],
  content: { type: 'doc', content: [{ type: 'paragraph' }] },
  injectCSS: false,
  editorProps: {
    attributes: {
      role: 'textbox',
      'aria-label': 'Document content',
      'aria-multiline': 'true',
      spellcheck: 'true',
    },
  },
};
