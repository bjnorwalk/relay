'use client';

import type { Editor } from '@tiptap/core';
import { useEffect, useRef, useState } from 'react';

import { runFormatting, setDocumentLink } from './formatting';
import styles from './selection-toolbar.module.css';

type LinkEditorProps = {
  editor: Editor;
  id: string;
  onClose: () => void;
};

export function LinkEditor({ editor, id, onClose }: LinkEditorProps) {
  const currentLink: unknown = editor.getAttributes('link').href;
  const [url, setUrl] = useState(
    typeof currentLink === 'string' ? currentLink : '',
  );
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <form
      id={id}
      className={styles.linkEditor}
      aria-label="Edit selected link"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!setDocumentLink(editor, url)) {
          setError('Enter a valid http, https, or mailto URL.');
          return;
        }
        onClose();
      }}
    >
      <label htmlFor={`${id}-url`}>Link address</label>
      <div className={styles.linkRow}>
        <input
          ref={input}
          id={`${id}-url`}
          type="url"
          value={url}
          placeholder="https://example.com"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          onChange={(event) => {
            setUrl(event.target.value);
            setError('');
          }}
        />
        <button type="submit" className={styles.textButton}>
          Apply
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
      {editor.isActive('link') && (
        <button
          type="button"
          className={styles.textButton}
          onClick={() => {
            runFormatting(editor, 'unlink');
            onClose();
          }}
        >
          Remove link
        </button>
      )}
    </form>
  );
}
