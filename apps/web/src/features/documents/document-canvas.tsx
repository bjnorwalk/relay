import styles from './document-canvas.module.css';

export function DocumentCanvas({ title }: { title: string }) {
  return (
    <article className={styles.canvas}>
      <h1 id="document-title" className={styles.title}>
        {title}
      </h1>
      <div className={styles.content}>
        <p className={styles.placeholder}>Start writing…</p>
        <p className={styles.previewNote}>Editing arrives in the next phase.</p>
      </div>
    </article>
  );
}
