import { DocumentEditor } from '../editor/editor';

import styles from './document-canvas.module.css';

export function DocumentCanvas({ title }: { title: string }) {
  return (
    <article className={styles.canvas}>
      <h1 id="document-title" className={styles.title}>
        {title}
      </h1>
      <div className={styles.content}>
        <DocumentEditor />
      </div>
    </article>
  );
}
