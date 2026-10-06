import styles from './workspace-shell.module.css';

export function StatusBar() {
  return (
    <footer className={styles.statusBar} aria-label="Workspace status">
      <button
        type="button"
        className={styles.commandHint}
        disabled
        title="Commands are not available yet"
        aria-label="Commands (not available yet)"
      >
        <span>Commands</span>
        <kbd aria-hidden="true">⌘ K</kbd>
      </button>
      <span title="Static preview. Document content is not persisted.">
        Preview <span aria-hidden="true">·</span> Not saved
      </span>
    </footer>
  );
}
