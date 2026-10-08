'use client';

import { useDocumentActions, useDocumentState } from './document-provider';
import styles from './save-status.module.css';

const messages = {
  loading: 'Opening document…',
  idle: 'Not saved yet',
  saving: 'Saving…',
  saved: 'Saved locally',
  error: 'Couldn’t save',
};
const reasons = {
  unavailable:
    'Browser storage is unavailable. This draft is only in this tab. Download it before reloading.',
  invalid:
    'The saved document could not be restored. It has been left untouched. You can download the saved data and this draft.',
  write:
    'The last save failed. Your changes are still in this tab. Retry saving or download the draft before leaving.',
  conflict:
    'The saved document changed in another tab. Autosave has stopped to protect both versions. Download this draft before reloading.',
};

function download(raw: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([raw], { type: 'application/json' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SaveStatus() {
  const { save } = useDocumentState();
  return (
    <span
      role="status"
      title="Stored in this browser on this site. Not synced across devices."
    >
      {messages[save.kind]}
    </span>
  );
}

export function SaveRecovery() {
  const { save } = useDocumentState();
  const actions = useDocumentActions();
  if (save.kind !== 'error') return null;
  return (
    <aside className={styles.notice} aria-label="Document recovery">
      <p role="alert">{reasons[save.reason]}</p>
      <div className={styles.actions}>
        {save.reason === 'write' && (
          <button type="button" onClick={() => actions.getAutosave()?.flush()}>
            Retry save
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            const draft = actions.getAutosave()?.getDraft();
            if (draft)
              download(JSON.stringify(draft, null, 2), 'slate-draft.json');
          }}
        >
          Download draft
        </button>
        {save.reason === 'invalid' && (
          <button
            type="button"
            onClick={() => {
              const raw = actions.getAutosave()?.getStoredData();
              if (raw !== null && raw !== undefined)
                download(raw, 'slate-saved-data.json');
            }}
          >
            Download saved data
          </button>
        )}
      </div>
    </aside>
  );
}
