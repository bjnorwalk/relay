import { DocumentEditor } from '../editor/editor';

import { DocumentTitle } from './document-provider';
import { SaveRecovery } from './save-status';

import styles from './document-canvas.module.css';

export function DocumentCanvas() {
  return (
    <article className={styles.canvas}>
      <h1 id="document-title" className={styles.title}>
        <DocumentTitle />
      </h1>
      <SaveRecovery />
      <div className={styles.content}>
        <DocumentEditor />
      </div>
    </article>
  );
}
